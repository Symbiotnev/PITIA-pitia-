import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../libs/firebase_config.mjs';

const EditItem = ({ item, onClose, onUpdate }) => {
  const [updatedItem, setUpdatedItem] = useState({
    name: item.name,
    price: item.price,
    currency: item.currency,
    imageUrl: item.imageUrl,
    newImage: null
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUpdatedItem({ ...updatedItem, newImage: file });
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      let imageUrl = updatedItem.imageUrl;
      if (updatedItem.newImage) {
        // Delete the old image if it exists
        if (updatedItem.imageUrl) {
          const oldImageRef = ref(storage, updatedItem.imageUrl);
          await deleteObject(oldImageRef);
        }
        // Upload the new image
        const imageRef = ref(storage, `menuItems/${item.userId}/${Date.now()}_${updatedItem.newImage.name}`);
        await uploadBytes(imageRef, updatedItem.newImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Update item details in Firestore
      await updateDoc(doc(db, 'menuItems', item.id), {
        name: updatedItem.name,
        price: updatedItem.price,
        currency: updatedItem.currency,
        imageUrl
      });

      onUpdate(); // Callback to refresh the menu
      onClose();  // Close the modal after updating
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={updatedItem.name}
            onChange={(e) => setUpdatedItem({ ...updatedItem, name: e.target.value })}
            placeholder="Item name"
            className="w-full p-2 border rounded-md"
          />
          <input
            type="number"
            value={updatedItem.price}
            onChange={(e) => setUpdatedItem({ ...updatedItem, price: e.target.value })}
            placeholder="Price"
            className="w-full p-2 border rounded-md"
          />
          <select
            value={updatedItem.currency}
            onChange={(e) => setUpdatedItem({ ...updatedItem, currency: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="USD">USD</option>
            <option value="KSH">KSH</option>
            <option value="EUR">EUR</option>
          </select>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
          />
          {updatedItem.newImage ? (
            <img
              src={URL.createObjectURL(updatedItem.newImage)}
              alt="New Preview"
              className="w-full h-32 object-cover rounded-md mt-2"
            />
          ) : (
            <img
              src={updatedItem.imageUrl}
              alt={updatedItem.name}
              className="w-full h-32 object-cover rounded-md mt-2"
            />
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
