import React, { useEffect, useState } from 'react';
import {GridComponent, ColumnDirective, ColumnsDirective,Resize,Sort,ContextMenu,Filter
  ,Page, ExcelExport,PdfExport,Edit,Inject} from '@syncfusion/ej2-react-grids';
import {Header} from '../components';

const API_URL = 'http://localhost:4000/cab_models';

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const normalizedOrders = Array.isArray(data) ? data.map((order, index) => ({
          id: order._id || `${order.mobileNumber}-${index}`,
          serialNumber: index + 1,
          name: order.name || '-',
          email: order.email || '-',
          vehicleType: order.vehicleType || '-',
          numberOfPersons: order.numberOfPersons ?? '-',
          pickup: order.pickup || '-',
          destination: order.destination || '-',
          mobileNumber: order.mobileNumber || '-',
          fromDate: formatDate(order.fromDate),
          toDate: formatDate(order.toDate),
          bookingDate: formatDate(order.createdAt),
        })) : [];

        setOrders(normalizedOrders);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load cab bookings.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, []);

  return (
    <div className='m-2 md:m-10 p-2 md:p-10 bg-white rounded-3xl'>
      <Header category="Page" title="Cab Bookings"/>
      {error && (
        <p className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </p>
      )}
      <GridComponent
        id='gridcomp'
        dataSource={orders}
        allowPaging
        allowSorting
        loadingIndicator={{ indicatorType: 'Shimmer' }}
      >
        <ColumnsDirective>
          <ColumnDirective field='serialNumber' headerText='S. No.' textAlign='Center' width='110' />
          <ColumnDirective field='name' headerText='Name' textAlign='Center' width='180' />
          <ColumnDirective field='email' headerText='Email' textAlign='Center' width='220' />
          <ColumnDirective field='vehicleType' headerText='Vehicle Type' textAlign='Center' width='150' />
          <ColumnDirective field='numberOfPersons' headerText='No. of Persons' textAlign='Center' width='150' />
          <ColumnDirective field='pickup' headerText='Pickup' textAlign='Center' width='200' />
          <ColumnDirective field='destination' headerText='Destination' textAlign='Center' width='220' />
          <ColumnDirective field='mobileNumber' headerText='M. Number' textAlign='Center' width='150' />
          <ColumnDirective field='fromDate' headerText='From Date' textAlign='Center' width='140' />
          <ColumnDirective field='toDate' headerText='To Date' textAlign='Center' width='140' />
          <ColumnDirective field='bookingDate' headerText='Date of Booking' textAlign='Center' width='160' />
        </ColumnsDirective>
        <Inject services={[Resize,Sort,ContextMenu,Filter,Page,ExcelExport,Edit,PdfExport]}/>
      </GridComponent>
      {!isLoading && !error && orders.length === 0 && (
        <p className='mt-4 text-sm text-gray-500'>No cab bookings found.</p>
      )}

    </div>
  )
}

export default Orders
