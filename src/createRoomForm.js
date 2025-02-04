import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

function CreateRoomForm({ isOpen, onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState('');
  const [isPersistent, setIsPersistent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom({ roomName, isPersistent });
    setRoomName('');
    setIsPersistent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded max-w-sm mx-auto p-6">
          <Dialog.Title className="text-xl font-bold">Create Room</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPersistent}
                  onChange={(e) => setIsPersistent(e.target.checked)}
                  className="mr-2"
                />
                Persistent
              </label>
            </div>
            <div className="mt-6">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

export default CreateRoomForm;