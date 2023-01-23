import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import DramaCard from './components/DramaCard';
import CreateNewForm from './components/CreateNewForm';
import Axios from 'axios';

function App() {
  const [dramaState, setDramaState] = useState([]);

  useEffect(() => {
    getData().then((data) => {
      setDramaState(data);
    });
  }, []);

  return (
    <>
      <div className='container'>
        <p>
          <a href='/'>&laquo; Back to public homePage</a>
        </p>
        <p>
          This is dramalist {dramaState.length} app powered by Express,Mongodb
          and Nodejs
        </p>
        <CreateNewForm setDramaState={setDramaState} />
        <div className='drama-grid'>
          {dramaState.map((drama, idx) => (
            <DramaCard
              key={drama._id}
              drama={drama}
              setDramaState={setDramaState}
              photo={drama.photo}
            />
          ))}
        </div>
      </div>
    </>
  );
}
const root = createRoot(document.getElementById('app'));
root.render(<App />);

// Axulary func
export async function getData() {
  const response = await Axios.get('/api/dramas');
  return response.data;
}
