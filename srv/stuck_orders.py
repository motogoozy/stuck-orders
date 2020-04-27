from datetime import datetime
from dateutil import tz
import json
import falcon

from sqlalchemy import (
    func,
    create_engine,
    )

from sqlalchemy.sql import (
    column,
    select,
    )

from sqlalchemy.orm import (
    sessionmaker,
    scoped_session,
    )


# The following class was taken from the following link
# https://falcon.readthedocs.io/en/stable/user/faq.html#how-do-i-implement-cors-with-falcon
# On 31 March the code was changed to always set the Access-Control-Allow-Headers header
# in order to resolve issues in Kyle's development environment.
# The original line was commented out and the second statement in process_response
# was added.
class CORSComponent(object):
    def process_response(self, req, resp, resource, req_succeeded):
        resp.set_header('Access-Control-Allow-Origin', '*')
        resp.set_header('Access-Control-Allow-Headers', 'Authorization')
        
        if (req_succeeded
            and req.method == 'OPTIONS'
            and req.get_header('Access-Control-Request-Method')
        ):
            # NOTE(kgriffs): This is a CORS preflight request. Patch the
            #   response accordingly.
            
            allow = resp.get_header('Allow')
            resp.delete_header('Allow')
            
            allow_headers = req.get_header(
                'Access-Control-Request-Headers',
                default='*'
            )
            
            resp.set_headers((
                ('Access-Control-Allow-Methods', allow),
                # ('Access-Control-Allow-Headers', allow_headers)
                ('Access-Control-Max-Age', '86400'),  # 24 hours
            ))
            
# s = select([column('client'), ...]).select_from(func.stuck_orders())
# stuck_orders = [dict(x.items()) for x in session.execute(s)]
# {'report_time': session.query(func.now()).scalar().isoformat(), 'stuck_orders': stuck_orders}
class StuckOrders(object):
    def __init__(self, connection):
        self.engine = create_engine(connection)
        self.session = scoped_session(sessionmaker(bind=self.engine))
        self.columns = [column('client'),
                        column('client_db_name'),
                        column('order_number'),
                        column('expedited'),
                        column('order_status'),
                        column('status_change_timestamp'),
                        column('status_change_business_age'),
                        column('status_change_raw_age'),
                        column('approval_timestamp'),
                        column('approval_business_age'),
                        column('approval_raw_age'),
                        column('order_timestamp'),
                        column('order_business_age'),
                        column('order_raw_age'),
                        column('report_timestamp'),
                        column('expedited_approval_alert'),
                        column('standard_approval_alert'),
                        column('aged_order_gte_72_lt_96_alert'),
                        column('aged_order_gte_96_alert'),
                        column('service_number'),
                        column('device_type'),
                        column('order_type'),
                        column('make'),
                        column('model'),
                        column('subscriber_name'),
                        column('carrier'),
                        column('notes'),
                        ]
        self.select = select(self.columns).select_from(func.stuck_orders())
        
    def on_get(self, req, resp):
        def converter(thing):
            if hasattr(thing, 'isoformat'):
                return thing.isoformat()
            if hasattr(thing, '__str__'):
                return thing.__str__()
                
        stuck_orders = {'report_time': self.session.query(func.now()).scalar(),
                        'stuck_orders': [dict(x.items()) for x in self.session.execute(self.select)],
                        }
        resp.body = json.dumps(stuck_orders, default=converter)
        resp.status = falcon.HTTP_200

api = application = falcon.API(middleware=[CORSComponent()])
api.add_route('/stuck_orders', StuckOrders('postgresql+psycopg2://localhost:18042/stuck_orders'))
