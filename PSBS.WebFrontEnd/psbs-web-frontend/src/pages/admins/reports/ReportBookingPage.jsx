import React, { useRef, useState } from 'react';
import ReportBookingStatusList from '../../../components/report/ReportBookingStatusList';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import ReportIncome from '../../../components/report/ReportIncome';
import ReportBookingServiceItem from '../../../components/report/ReportBookingServiceItem';
import ReportRoomHistory from '../../../components/report/ReportRoomHistory';
import ReportServiceType from '../../../components/report/ReportServiceType';
import ReportRoomStatusList from '../../../components/report/ReportRoomStatusList';
import ReportRoomType from '../../../components/report/ReportRoomType';
import ReportPet from '../../../components/report/ReportPet';
import ReportAccountList from '../../../components/report/ReportAccountList';
import ReportGeneral from '../../../components/report/ReportGeneral';

const ReportBookingPage = () => {
  const sidebarRef = useRef(null);

  const [type, setType] = useState('General');

  const selectedTypes = ['General','Booking', 'Service', 'Room', 'Pet'];

  return (
    <div className=''>
      <Sidebar ref={sidebarRef} />
      <div class='content'>
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className='header'>
            <div className='left'>
              <h1>
                Report For{' '}
                <span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className='p-3 rounded-xl'
                  >
                    {selectedTypes.map((item) => (
                      <option value={item}>{item}</option>
                    ))}
                  </select>
                </span>
              </h1>
            </div>
          </div>

          {type === 'General' && (
            <div className='p-3 rounded-3xl bg-neutral-200'>
              <div className='mb-5'>
                <div className='flex justify-center'>
                  <p className='text-2xl font-bold rounded-lg  p-3'>
                    General key metrics
                  </p>
                </div>
                <ReportGeneral />
              </div>
            </div>
          )}

          {type === 'Booking' && (
            <div className='p-3 rounded-3xl bg-neutral-200'>
              <div className='mb-5'>
                <div className='flex justify-center'>
                  <p className='text-2xl font-bold rounded-lg  p-3'>
                    Number of bookings by status
                  </p>
                </div>
                <ReportBookingStatusList />
              </div>
              <div className='mb-5'>
                <div className='flex justify-start items-center'>
                  <div>
                    <div className='flex justify-center'>
                      <p className='text-2xl font-bold rounded-lg  p-3'>
                        Number of bookings by service
                      </p>
                    </div>
                    <ReportBookingServiceItem />
                  </div>
                  <div>
                    <div className='flex justify-center'>
                      <p className='text-2xl font-bold rounded-lg  p-3'>
                        Number of bookings by room type
                      </p>
                    </div>
                    <ReportRoomHistory />
                  </div>
                </div>
              </div>
              <div className='mb-3'>
                <div className='p-3 bg-neutral-900 rounded-3xl'>
                  <div className='flex justify-center'>
                    <p className='text-2xl font-bold rounded-lg text-white p-3'>
                      Total revenue of bookings
                    </p>
                  </div>
                  <ReportIncome />
                </div>
              </div>
            </div>
          )}
          {type === 'Service' && (
            <div className='p-3 rounded-3xl bg-neutral-200'>
              <div className='mb-5'>
                <div className='flex justify-center'>
                  <p className='text-2xl font-bold rounded-lg  p-3'>
                    Number of services by service type
                  </p>
                </div>
                <div className='flex justify-center'>
                  <ReportServiceType />
                </div>
              </div>
            </div>
          )}
          {type === 'Room' && (
            <div className='p-3 rounded-3xl bg-neutral-200'>
              <div className='mb-5'>
                <div className='flex justify-center'>
                  <p className='text-2xl font-bold rounded-lg  p-3'>
                    Number of room by status
                  </p>
                </div>
                <ReportRoomStatusList />
              </div>

              <div className='mb-5'>
                <div className='flex justify-center'>
                  <p className='text-2xl font-bold rounded-lg  p-3'>
                    Number of rooms by room type
                  </p>
                </div>
                <div className='flex justify-center'>
                  <ReportRoomType />
                </div>
              </div>
            </div>
          )}

          {type === 'Pet' && (
            <div className='p-3 rounded-3xl bg-neutral-200'>
              <div className='mb-5'>
                <div className='flex justify-center'>
                  <p className='text-2xl font-bold rounded-lg  p-3'>
                    Service booking rate by pet breed{' '}
                    <span className='italic text-xl'>
                      {' '}
                      (unit: number of pets)
                    </span>
                  </p>
                </div>
                <div className='flex justify-center'>
                  <ReportPet />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ReportBookingPage;
