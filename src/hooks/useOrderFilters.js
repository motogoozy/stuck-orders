import { useState, useEffect } from 'react';

import queryString from 'query-string';

export default function useOrderFilters(defaultValue, search) {
  const [filters, setFilters] = useState(defaultValue);

  useEffect(() => {
    const alerts = [
      'expedited_approval_alert',
      'standard_approval_alert',
      'aged_order_gte_72_lt_96_alert',
      'aged_order_gte_96_alert',
    ];
    const validDays = ['0', '1', '2', '3', '4', '5', '6', '7', '8+'];
    const queryValues = queryString.parse(search);

    if (search) {
      if (alerts.includes(queryValues.alert)) {
        setFilters(filters => {
          return { ...filters, alert: queryValues.alert };
        });
      }
      if (queryValues.status_age) {
        let age = queryValues.status_age.trim();
        if (age === '8') {
          age = '8+';
        }
        if (validDays.includes(age)) {
          setFilters(filters => {
            return { ...filters, status_age: age };
          });
        }
      }
      if (queryValues.approval_age) {
        let age = queryValues.approval_age.trim();
        if (age === '8') {
          age = '8+';
        }

        if (validDays.includes(age)) {
          setFilters(filters => {
            return { ...filters, approval_age: age };
          });
        }
      }
      if (queryValues.client) {
        setFilters(filters => {
          return { ...filters, client: queryValues.client };
        });
      }
      if (queryValues.expedited) {
        setFilters(filters => {
          return { ...filters, expedited: queryValues.expedited };
        });
      }
      if (queryValues.order_status) {
        setFilters(filters => {
          return { ...filters, order_status: queryValues.order_status };
        });
      }
    }
  }, [search]);

  return [filters, setFilters];
}
