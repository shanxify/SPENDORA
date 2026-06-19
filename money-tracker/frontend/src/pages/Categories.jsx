import React, { useState, useEffect } from 'react';
import Client from '../api/client';
import TopNav from '../components/Layout/TopNav';
import CategoryManager from '../components/Categories/CategoryManager';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCategories = async () => {
    try {
      setErrorMsg(null);
      const data = await Client.getCategories();
      if (data && data.error) {
        setErrorMsg(data.error);
        setCategories([]);
      } else {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setErrorMsg(error.response?.data?.error || error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (data) => {
    try {
      await Client.createCategory(data);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || error.message);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await Client.updateCategory(id, data);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Client.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="min-h-full bg-primary-bg pb-10">
      <TopNav 
        title="Categories"
        meta="Manage your transaction categories"
      />
      
      <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-300" style={{ padding: '24px 40px' }}>
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
        {loading ? (
          <div className="w-full flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <CategoryManager 
            categories={categories}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Categories;
