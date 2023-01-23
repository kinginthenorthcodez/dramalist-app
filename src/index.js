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

  console.log('STATE:', dramaState);
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
export const loadData = async () => {
  console.log('Loading data...');
  const response = await fetch('http://localhost:3000/api/dramas');
  const data = await response.json();
  console.log('DATA FETCHED: ', data);
  const dramas = [];
  data.forEach((item) => {
    let drama = {
      name: item.name,
      type: item.type,
      genre: item.genre,
    };

    dramas.push(drama);
  });
  console.log('DRAMAS FORMATED:', dramas);
  // setDramaState([...dramas]);
  return dramas;
};
