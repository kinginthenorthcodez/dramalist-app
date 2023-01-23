import Axios from 'axios';
import React, { useState } from 'react';
const DramaCard = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState('');
  const [draftGenre, setDraftGenre] = useState('');
  const [file, setFile] = useState();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsEditing(false);
    props.setDramaState((prev) =>
      prev.map((drama) => {
        if (drama._id == props.drama._id) {
          return {
            ...drama,
            name: draftName,
            type: draftType,
            genre: draftGenre,
          };
        }
        return drama;
      })
    );
    const data = new FormData();
    if (file) {
      data.append('photo', file);
    }
    data.append('_id', props.drama._id);
    data.append('name', props.drama.name);
    data.append('type', props.drama.type);
    data.append('genre', props.drama.genre);
    const newPhoto = await Axios.post('/update-drama', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (newPhoto.data) {
      props.setDramaState((prev) => {
        return prev.map((drama) => {
          if (drama._id == props.drama._id) {
            return { ...drama, photo: newPhoto.data };
          }
          return drama;
        });
      });
    }
  }

  return (
    <div className='card'>
      <div className='card-top'>
        {isEditing && (
          <div className='custom-input'>
            <div className='custom-input-interior'>
              <input
                type='file'
                className='form-control form-control-sm'
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>
        )}
        <img
          src={
            props.photo ? `/uploaded-photos/${props.photo}` : '/fallback.png'
          }
          // alt={`${props.drama.name} named ${props.drama.type}`}
          className='card-img-top'
        />
      </div>
      <div className='card-body'>
        {!isEditing && (
          <>
            <h4 className='drama-title'>{props.drama.name}</h4>
            <p className=' text-muted small'>Type: {props.drama.type}</p>
            <p className=' text-muted small'>Genre: {props.drama.genre}</p>
            <p className=' text-muted small'>Synopsis: Lorem ipsum</p>
            {!props.readOnly && (
              <>
                <button
                  className='btn btn small btn-primary'
                  onClick={() => {
                    setIsEditing(true);
                    setDraftName(props.drama.name);
                    setDraftType(props.drama.type);
                    setDraftGenre(props.drama.genre);
                    setFile('');
                  }}
                >
                  Edit
                </button>
                <button
                  className='btn btn small btn-outline-danger'
                  onClick={async () => {
                    await Axios.delete(`/dramas/${props.drama._id}`);
                    props.setDramaState((prev) => {
                      return prev.filter(
                        (drama) => drama._id != props.drama._id
                      );
                    });
                  }}
                >
                  delete
                </button>
              </>
            )}
          </>
        )}

        {isEditing && (
          <form onSubmit={handleSubmit}>
            <div className='mb-1'>
              <input
                type='text'
                autoFocus
                value={draftName}
                className='form-control form-control-sm'
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>
            <div className='mb-2'>
              <input
                type='text'
                value={draftType}
                className='form-control form-control-sm'
                onChange={(e) => setDraftType(e.target.value)}
              />
            </div>
            <div className='mb-3'>
              <input
                type='text'
                value={draftGenre}
                className='form-control form-control-sm'
                onChange={(e) => setDraftGenre(e.target.value)}
              />
            </div>
            <button className='btn btn-sm btn-success'>Save</button>
            <button
              className='btn btn-sm btn-outline-secondary'
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DramaCard;
