--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.3
-- Dumped by pg_dump version 9.6.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plproxy; Type: SCHEMA; Schema: -; Owner: ms
--

CREATE SCHEMA plproxy;


ALTER SCHEMA plproxy OWNER TO ms;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: plproxy; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plproxy WITH SCHEMA public;


--
-- Name: EXTENSION plproxy; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plproxy IS 'Database partitioning implemented as procedural language';


SET search_path = plproxy, pg_catalog;

--
-- Name: get_cluster_config(text); Type: FUNCTION; Schema: plproxy; Owner: ms
--

CREATE FUNCTION get_cluster_config(cluster_name text, OUT key text, OUT val text) RETURNS SETOF record
    LANGUAGE plpgsql
    AS $$
begin
    key := 'connection_lifetime';
    val := (30*60)::text;
    return next;
    return;
end;
$$;


ALTER FUNCTION plproxy.get_cluster_config(cluster_name text, OUT key text, OUT val text) OWNER TO ms;

--
-- Name: get_cluster_partitions(text); Type: FUNCTION; Schema: plproxy; Owner: ms
--

CREATE FUNCTION get_cluster_partitions(cluster_name text) RETURNS SETOF text
    LANGUAGE plpgsql
    AS $_$
declare
    the_limit           int;
    i                   int := 0;
    the_connection      text;
    the_cursor          refcursor;
    the_query           text;
    the_row             record;
    the_template        text := 'dbname=%s host=%s port=%s user=ms';
    the_db              text;
    the_address         text;
    the_port            int;
begin
    if cluster_name = 'bootstrap'
    then
        the_query := $$select 'postgres'::text as db, host(address)::text as address, native_port as port from plproxy.hosts$$;
    else
        the_query := $$select db::text, host(address)::text as address, bouncer_port as port from plproxy.client_dbs cd join plproxy.hosts h on h.id = cd.host_id where active$$;
    end if;
    open the_cursor for execute the_query;
    loop
        fetch the_cursor into the_db, the_address, the_port;
        exit when not found;
        the_connection := format(the_template, the_db, the_address, the_port)::text;
        i := i + 1;
        return next the_connection;
    end loop;
    if i = 0
    then
        return;
    end if;
    the_limit := 2;
    loop
        if the_limit >= i
        then
            exit;
        end if;
        the_limit := the_limit * 2;
    end loop;
    loop
        if i = the_limit
        then
            exit;
        end if;
        return next the_connection;
        i := i + 1;
    end loop;
    return;
end;
$_$;


ALTER FUNCTION plproxy.get_cluster_partitions(cluster_name text) OWNER TO ms;

--
-- Name: get_cluster_version(text); Type: FUNCTION; Schema: plproxy; Owner: ms
--

CREATE FUNCTION get_cluster_version(the_cluster_name text) RETURNS integer
    LANGUAGE sql
    AS $$
   select version
     from plproxy.cluster_versions
    where cluster_name = the_cluster_name
$$;


ALTER FUNCTION plproxy.get_cluster_version(the_cluster_name text) OWNER TO ms;

--
-- Name: manage_cluster_version(); Type: FUNCTION; Schema: plproxy; Owner: ms
--

CREATE FUNCTION manage_cluster_version() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
         insert
           into plproxy.cluster_versions
              ( cluster_name
              )
         values
              ( 'active'
              )
    on conflict (cluster_name)
      do update
            set version = extract(epoch from now())::int
    ;
    
    return null
    ;
end;    
$$;


ALTER FUNCTION plproxy.manage_cluster_version() OWNER TO ms;

SET search_path = public, pg_catalog;

--
-- Name: client_dbs(); Type: FUNCTION; Schema: public; Owner: ms
--

CREATE FUNCTION client_dbs() RETURNS TABLE(db character varying, address inet)
    LANGUAGE plproxy
    AS $$
    cluster 'bootstrap';
    run on all;
    select datname as db
         , inet_server_addr() as address
      from pg_database;
$$;


ALTER FUNCTION public.client_dbs() OWNER TO ms;

--
-- Name: refresh_client_dbs(); Type: FUNCTION; Schema: public; Owner: ms
--

CREATE FUNCTION refresh_client_dbs() RETURNS void
    LANGUAGE sql
    AS $$
     insert
       into plproxy.client_dbs
          ( db
          , host_id
          , active
          )
     select cd.db
          , h.id
          , de.id is null
       from client_dbs() cd
       join plproxy.hosts h using (address)
  left join plproxy.db_exclusions de on cd.db = de.db
on conflict do nothing
;

  delete
       from plproxy.client_dbs cd
      where not exists (   select 1
                             from client_dbs() cdf
                             join plproxy.hosts h using (address)
                            where cd.db = cdf.db
                              and cd.host_id = h.id
                       )
;

   update plproxy.client_dbs cd
      set active = false
     from plproxy.db_exclusions de
    where cd.db = de.db
      and cd.active
;

   update plproxy.client_dbs cd
      set active = true
    where not exists (   select 1
                           from plproxy.db_exclusions de
                          where cd.db = de.db
                     )
      and not cd.active
;
$$;


ALTER FUNCTION public.refresh_client_dbs() OWNER TO ms;

--
-- Name: stuck_orders(); Type: FUNCTION; Schema: public; Owner: ms
--

create function legacy_stuck_orders()
returns table( client text
             , client_db_name text
             , order_number text
             , expedited boolean
             , order_status text
             , status_change_timestamp timestamp with time zone
             , status_change_business_age integer
             , status_change_raw_age integer
             , approval_timestamp timestamp with time zone
             , approval_business_age integer
             , approval_raw_age integer
             , order_timestamp timestamp with time zone
             , order_business_age integer
             , order_raw_age integer
             , report_timestamp timestamp with time zone
             , expedited_approval_alert boolean
             , standard_approval_alert boolean
             , pending_order_alert boolean
             , expedited_aged_order_alert boolean
             , standard_aged_order_alert boolean
             , service_number text
             , device_type text
             , order_type text
             , make text
             , model text
             , subscriber_name text
             , carrier text
             , notes text
             )
language plproxy
as $$
    cluster 'active';
    run on all;
    select client
         , client_db_name
         , order_number
         , expedited
         , order_status
         , status_change_timestamp
         , status_change_business_age
         , status_change_raw_age
         , approval_timestamp
         , approval_business_age
         , approval_raw_age
         , order_timestamp
         , order_business_age
         , order_raw_age
         , report_timestamp
         , expedited_approval_alert
         , standard_approval_alert
         , pending_order_alert
         , expedited_aged_order_alert
         , standard_aged_order_alert
         , service_number
         , device_type
         , order_type
         , make
         , model
         , subscriber_name
         , carrier
         , notes
      from legacy_stuck_orders;
$$
;

create function stuck_orders()
returns table( client text
             , client_db_name text
             , order_number text
             , expedited boolean
             , order_status text
             , status_change_timestamp timestamp with time zone
             , status_change_business_age integer
             , status_change_raw_age integer
             , approval_timestamp timestamp with time zone
             , approval_business_age integer
             , approval_raw_age integer
             , order_timestamp timestamp with time zone
             , order_business_age integer
             , order_raw_age integer
             , report_timestamp timestamp with time zone
             , expedited_approval_alert boolean
             , standard_approval_alert boolean
             , aged_order_gte_72_lt_96_alert boolean
             , aged_order_gte_96_alert boolean
             , service_number text
             , device_type text
             , order_type text
             , make text
             , model text
             , subscriber_name text
             , carrier text
             , notes text
             )
language plproxy
as $$
    cluster 'active';
    run on all;
    select client
         , client_db_name
         , order_number
         , expedited
         , order_status
         , status_change_timestamp
         , status_change_business_age
         , status_change_raw_age
         , approval_timestamp
         , approval_business_age
         , approval_raw_age
         , order_timestamp
         , order_business_age
         , order_raw_age
         , report_timestamp
         , expedited_approval_alert
         , standard_approval_alert
         , aged_order_gte_72_lt_96_alert
         , aged_order_gte_96_alert
         , service_number
         , device_type
         , order_type
         , make
         , model
         , subscriber_name
         , carrier
         , notes
      from stuck_orders;
$$
;

alter function public.stuck_orders() owner to ms
;

SET search_path = plproxy, pg_catalog;

--
-- Name: client_dbs_id_seq; Type: SEQUENCE; Schema: plproxy; Owner: ms
--

CREATE SEQUENCE client_dbs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE client_dbs_id_seq OWNER TO ms;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: client_dbs; Type: TABLE; Schema: plproxy; Owner: ms
--

CREATE TABLE client_dbs (
    id integer DEFAULT nextval('client_dbs_id_seq'::regclass) NOT NULL,
    db character varying(24) NOT NULL,
    host_id integer NOT NULL,
    active boolean NOT NULL
);


ALTER TABLE client_dbs OWNER TO ms;

--
-- Name: cluster_versions_id_seq; Type: SEQUENCE; Schema: plproxy; Owner: ms
--

CREATE SEQUENCE cluster_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE cluster_versions_id_seq OWNER TO ms;

--
-- Name: cluster_versions; Type: TABLE; Schema: plproxy; Owner: ms
--

CREATE TABLE cluster_versions (
    id integer DEFAULT nextval('cluster_versions_id_seq'::regclass) NOT NULL,
    cluster_name character varying(16) NOT NULL,
    version integer DEFAULT (date_part('epoch'::text, now()))::integer NOT NULL
);


ALTER TABLE cluster_versions OWNER TO ms;

--
-- Name: db_exclusions_id_seq; Type: SEQUENCE; Schema: plproxy; Owner: ms
--

CREATE SEQUENCE db_exclusions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE db_exclusions_id_seq OWNER TO ms;

--
-- Name: db_exclusions; Type: TABLE; Schema: plproxy; Owner: ms
--

CREATE TABLE db_exclusions (
    id integer DEFAULT nextval('db_exclusions_id_seq'::regclass) NOT NULL,
    db character varying(24) NOT NULL,
    reason text NOT NULL
);


ALTER TABLE db_exclusions OWNER TO ms;

--
-- Name: hosts_id_seq; Type: SEQUENCE; Schema: plproxy; Owner: ms
--

CREATE SEQUENCE hosts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE hosts_id_seq OWNER TO ms;

--
-- Name: hosts; Type: TABLE; Schema: plproxy; Owner: ms
--

CREATE TABLE hosts (
    id integer DEFAULT nextval('hosts_id_seq'::regclass) NOT NULL,
    name character varying(4) NOT NULL,
    address inet NOT NULL,
    native_port integer NOT NULL,
    bouncer_port integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE hosts OWNER TO ms;

--
-- Data for Name: client_dbs; Type: TABLE DATA; Schema: plproxy; Owner: ms
--

COPY client_dbs (id, db, host_id, active) FROM stdin;
1	atlantictomorrow	1	t
2	yakamanation	1	t
3	bladencounty	1	t
4	template1	1	f
6	template0	1	f
8	allanbros	1	t
9	androscoggin	1	t
10	avis	1	t
11	breezyhill	1	t
12	brookfield	1	t
13	brucecompany	1	t
14	bsh	1	t
15	cedarrapidsschool	1	t
16	chesterbross	1	t
17	choctawnation	1	t
18	cnbrown	1	t
19	compressor	1	t
20	covenanthealth	1	t
21	cudahy	1	t
22	desmoines	1	t
23	postgres	1	f
24	drh	1	t
25	emhs	1	t
26	exactsciences	1	t
27	farmerscoop	1	t
28	fbm	1	t
29	franklincounty	1	t
30	genesismedical	1	t
31	holidaywholesale	1	t
32	hospicecompassus	1	t
33	johnsonvillefoods	1	t
34	oneok	1	t
35	kenoshasd	1	t
36	laredo	1	t
37	linkassociates	1	t
38	mainecfs	1	t
39	manatts	1	t
40	meoit	1	t
41	mestate	1	t
42	milwaukeepubschls	1	t
43	milwaukeeschools	1	t
44	missionhealth	1	t
45	mohawk	1	t
46	pacificorp	1	t
48	portlandglass	1	t
49	putzmeister	1	t
52	srhousingconsult	1	t
53	stoughton	1	t
54	sunheavenfarms	1	t
56	tcmh	1	t
57	unitypoint	1	t
58	tribunemedia	1	t
59	sinclairtractor	1	t
60	medtronic	1	t
61	washingtoncity	1	t
62	lambweston	1	t
63	badger	1	t
64	longbeverage	1	f
65	homestreet	1	t
66	huppmotors	1	t
67	pieper	1	t
68	davenportschools	1	t
69	duplincounty	1	t
70	nci	1	t
71	kohler	1	t
72	carolinaeast	1	t
73	spahnandrose	1	t
74	wash	1	f
75	globus	1	f
76	medicalodges	1	t
77	relativity	1	f
78	mscorp	1	t
79	walworthcounty	1	t
80	beaufortcounty	1	t
81	hrb	2	f
82	harc	2	t
84	template1	2	f
85	winnebagocounty	2	t
87	lcatterton	2	t
88	template0	2	f
89	7gdistributing	2	t
90	ahern	2	t
91	biltmore	2	t
92	darecounty	2	t
93	embarq	2	t
96	postgres	2	f
97	bcx	2	t
98	jonescounty	2	t
99	knoxville	2	t
100	mahle	2	t
101	mainedot	2	t
102	mfa	2	t
103	midam	2	t
104	milwaukee	2	t
105	milwaukeecounty	2	t
106	ncgov	2	t
107	orp	2	t
108	polsinelli	2	t
109	primetals	2	t
110	quinault	2	t
111	rockwellcollins	2	t
112	rollins	2	t
113	oncc	2	t
114	snyder	2	t
115	stc	2	t
116	truckcountry	2	t
117	umos	2	t
118	uwlacrosse	2	t
119	uwm	2	t
120	vidanthealth	2	t
122	omniglass	2	t
123	tricityelectric	2	t
124	capservices	2	t
126	imaginetp	2	t
127	uwpoint	2	t
128	medtronicpr	2	t
129	g4s	2	t
130	jacksoncounty	2	t
131	bardmaterials	2	t
132	gregorypoole	2	t
133	kodak	2	f
134	lerchbates	2	f
135	alliancelaundry	2	t
136	sjsmithwelding	2	t
137	hsm	2	t
138	mattconstruction	2	t
139	trane	2	t
140	buncombe	3	t
141	buttersfetting	3	t
142	sweetser	3	t
143	template1	3	f
144	easternfire	3	t
145	nep	3	t
146	template0	3	f
147	aea267	3	t
148	altorfer	3	t
149	senator	3	t
151	bnsf	3	t
152	ccls	3	t
153	centrahealth	3	t
154	cftc	3	t
155	communityconcepts	3	t
156	conlonconstruction	3	t
157	cooperriis	3	t
159	cundiffheating	3	t
160	davejonesplumb	3	t
161	deadriver	3	t
162	desertndt	3	t
163	dodgecounty	3	t
164	dovetail	3	t
165	postgres	3	f
167	firstatlantic	3	t
168	grinnell	3	t
169	gundersenlutheran	3	t
170	heartlandcoop	3	t
171	itlogistics	3	t
172	kci	3	t
173	kenoshahd	3	t
174	knoxcounty	3	t
175	marshill	3	t
176	memarine	3	t
177	monona	3	t
178	mum	3	t
179	murphybrown	3	t
180	nelsonelectric	3	t
181	rhfoster	3	t
182	ngrid	3	t
184	plans	3	f
186	scdata	3	t
187	seaboard	3	t
188	somersetcounty	3	t
189	trilliumhealth	3	t
191	uwgreenbay	3	t
192	uwhospital	3	t
193	valmont	3	t
194	vermeer	3	t
195	waupaca	3	t
196	wiscocomserv	3	t
197	wyckofffarms	3	t
198	lenoirschools	3	t
199	thiensville	3	t
200	agvantage	3	t
201	mbhaynes	3	t
202	laneconstruction	3	t
203	eilertson	3	t
204	peraton	3	t
205	yakama	3	t
206	sappi	3	t
207	mobilityexchange	3	t
208	rrdonnelley	3	t
209	trc	3	t
210	maf	3	f
211	wfbf	3	t
212	kenosha	3	t
213	racine	3	t
214	mims	3	f
223	commonbond	1	t
305	zuern	2	t
150	bakertilly	3	t
183	pariveda	3	t
158	crb	3	t
47	pernodricard	1	t
83	concho	2	t
55	superiorplusenergy	1	t
5	boise	1	t
121	omnimax	2	t
166	erac	3	t
185	ringcentral	3	t
86	countymaterials	2	t
94	empirica	2	t
51	sgt	1	t
125	ervincable	2	t
7	acuity	1	t
50	sei	1	t
190	utiliquest	3	t
95	evergreen	2	t
\.


--
-- Name: client_dbs_id_seq; Type: SEQUENCE SET; Schema: plproxy; Owner: ms
--

SELECT pg_catalog.setval('client_dbs_id_seq', 1510, true);


--
-- Data for Name: cluster_versions; Type: TABLE DATA; Schema: plproxy; Owner: ms
--

COPY cluster_versions (id, cluster_name, version) FROM stdin;
1	bootstrap	1584252765
2	active	1586064249
\.


--
-- Name: cluster_versions_id_seq; Type: SEQUENCE SET; Schema: plproxy; Owner: ms
--

SELECT pg_catalog.setval('cluster_versions_id_seq', 272, true);


--
-- Data for Name: db_exclusions; Type: TABLE DATA; Schema: plproxy; Owner: ms
--

COPY db_exclusions (id, db, reason) FROM stdin;
1	postgres	System database
2	template0	System database
3	template1	System database
4	plans	Non-client database
5	globus	Requested by Dave
6	hrb	Requested by Dave
7	kodak	Requested by Dave
8	lerchbates	Requested by Dave
9	longbeverage	Requested by Dave
10	maf	Requested by Dave
11	mims	Requested by Dave
12	relativity	Requested by Dave
13	wash	Requested by Dave
\.


--
-- Name: db_exclusions_id_seq; Type: SEQUENCE SET; Schema: plproxy; Owner: ms
--

SELECT pg_catalog.setval('db_exclusions_id_seq', 31, true);


--
-- Data for Name: hosts; Type: TABLE DATA; Schema: plproxy; Owner: ms
--

COPY hosts (id, name, address, native_port, bouncer_port, updated_at) FROM stdin;
1	as09	172.16.3.29	18082	18089	2020-03-15 00:12:44.918724-06
2	as10	172.16.3.110	18082	18089	2020-03-15 00:12:44.918724-06
3	as11	172.16.3.111	18082	18089	2020-03-15 00:12:44.918724-06
\.


--
-- Name: hosts_id_seq; Type: SEQUENCE SET; Schema: plproxy; Owner: ms
--

SELECT pg_catalog.setval('hosts_id_seq', 3, true);


--
-- Name: client_dbs cd_db_host_uk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY client_dbs
    ADD CONSTRAINT cd_db_host_uk UNIQUE (db, host_id);


--
-- Name: client_dbs cd_pk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY client_dbs
    ADD CONSTRAINT cd_pk PRIMARY KEY (id);


--
-- Name: cluster_versions cv_cluster_uk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY cluster_versions
    ADD CONSTRAINT cv_cluster_uk UNIQUE (cluster_name);


--
-- Name: cluster_versions cv_pk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY cluster_versions
    ADD CONSTRAINT cv_pk PRIMARY KEY (id);


--
-- Name: hosts h_pk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY hosts
    ADD CONSTRAINT h_pk PRIMARY KEY (id);


--
-- Name: db_exclusions id_db_uk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY db_exclusions
    ADD CONSTRAINT id_db_uk UNIQUE (db);


--
-- Name: db_exclusions id_pk; Type: CONSTRAINT; Schema: plproxy; Owner: ms
--

ALTER TABLE ONLY db_exclusions
    ADD CONSTRAINT id_pk PRIMARY KEY (id);


--
-- Name: client_dbs manage_cluster_version; Type: TRIGGER; Schema: plproxy; Owner: ms
--

CREATE TRIGGER manage_cluster_version AFTER INSERT OR DELETE OR UPDATE ON client_dbs FOR EACH ROW EXECUTE PROCEDURE manage_cluster_version();


--
-- PostgreSQL database dump complete
--

