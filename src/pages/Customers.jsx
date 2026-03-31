import React, { useEffect, useState } from 'react';
import {GridComponent,ColumnsDirective,ColumnDirective,Page,Selection,Inject,Edit,Toolbar,Sort,
  Filter} from '@syncfusion/ej2-react-grids';
import { Header } from '../components';

const API_URL = 'https://hihillsbackend-production.up.railway.app/customers';

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setError('');
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch(API_URL, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const normalizedCustomers = Array.isArray(data) ? data.map((customer, index) => ({
          id: customer._id || `${customer.email}-${index}`,
          serialNumber: index + 1,
          name: customer.name || '-',
          email: customer.email || '-',
          phone:customer.mobileNumber||'-',
          destination: customer.destination || '-',
          numberOfPersons: customer.numberOfPersons ?? '-',
          dateOfJourney: formatDate(customer.dateofjourney),
          createdAt: formatDate(customer.createdAt),
        })) : [];

        setCustomers(normalizedCustomers);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load customers.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();

    return () => controller.abort();
  }, []);

  return (
    <div className='m-2 md:m-10 p-2 md:p-10 bg-white rounded-3xl'>
      <Header category="Page" title="Customers"/>
      {error && (
        <p className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </p>
      )}
      <GridComponent
        dataSource={customers}
        allowPaging
        allowSorting
        toolbar={['Delete']}
        editSettings={{allowDeleting:true, allowEditing:true}}
        loadingIndicator={{ indicatorType: 'Shimmer' }}
        width="auto"
      >
        <ColumnsDirective>
          <ColumnDirective field='serialNumber' headerText='S. No.' textAlign='Center' width='110' />
          <ColumnDirective field='name' headerText='Name' textAlign='Center' width='180' />
          <ColumnDirective field='email' headerText='Email' textAlign='Center' width='220' />
          <ColumnDirective field='phone' headerText='phone' textAlign='Center' width='120' />
          <ColumnDirective field='destination' headerText='Destination' textAlign='Center' width='220' />
          <ColumnDirective field='numberOfPersons' headerText='No. of Persons' textAlign='Center' width='150' />
          <ColumnDirective field='dateOfJourney' headerText='Date of Journey' textAlign='Center' width='160' />
          <ColumnDirective field='createdAt' headerText='Date of Booking' textAlign='Center' width='160' />
        </ColumnsDirective>
        <Inject services={[Page,Toolbar, Selection, Edit, Sort, Filter]}/>
      </GridComponent>
      {!isLoading && !error && customers.length === 0 && (
        <p className='mt-4 text-sm text-gray-500'>No customers found.</p>
      )}

    </div>
  )
}

export default Customers
