import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/admins/dashboard-Admin/Dashboard';
import Homepage from './pages/customers/homepage-Customer/Homepage';
import PetTypeList from './pages/admins/PetType/PetTypeList';
import AddPetType from './pages/admins/PetType/AddPetType';
import PetTypeDetail from './pages/admins/PetType/PetTypeDetail';
import UpdatePetType from './pages/admins/PetType/UpdatePetType';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/customer' element={<Homepage />} />
          <Route path='/'>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path='/petType'>
            <Route index element={<PetTypeList />} />
          </Route>
          <Route path='/petType/add'>
            <Route index element={<AddPetType />} />
          </Route>
          <Route path='/petType/:id'>
            <Route index element={<PetTypeDetail />} />
          </Route>
          <Route path='/petType/edit/:id'>
            <Route index element={<UpdatePetType />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
