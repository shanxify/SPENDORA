import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import BorderGlow from '../BorderGlow';
import GlareHover from '../GlareHover';

const CategoryManager = ({ categories, onCreate, onUpdate, onDelete }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Modals for Modifying Categories
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editColor, setEditColor] = useState('');
  
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Modals/Inline for Creating
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', icon: '', color: '' });

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const handleEditClick = (category) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setEditIcon(category.icon);
    setEditColor(category.color || '#6C63FF');
    setShowEditModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(categoryToDelete.id);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmEdit = async () => {
    setEditing(true);
    try {
      await onUpdate(categoryToEdit.id, {
        name: editName,
        icon: editIcon,
        color: editColor
      });
      setShowEditModal(false);
      setCategoryToEdit(null);
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

  const handleCreateNew = async () => {
    if (!createForm.name) return;
    await onCreate(createForm);
    setIsCreating(false);
    setCreateForm({ name: '', icon: '', color: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-syne font-bold text-text-primary">Manage Categories</h2>
        <GlareHover
          background="transparent"
          borderRadius="8px"
          borderColor="transparent"
          glareColor="#c084fc"
          glareOpacity={0.2}
          glareAngle={-30}
          glareSize={250}
          transitionDuration={650}
          width="auto"
          height="auto"
          style={{ width: 'auto', height: 'auto' }}
        >
          <button 
            onClick={() => {
              setIsCreating(true);
              setCreateForm({ name: '', icon: '📁', color: '#95A5A6' });
            }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </GlareHover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isCreating && (
          <div className="bg-card border-2 border-accent border-dashed rounded-xl p-4 shadow-lg shadow-accent/5">
            <div className="space-y-3 mb-4">
              <input 
                className="input-field w-full text-sm" 
                placeholder="Category Name"
                value={createForm.name}
                onChange={e => setCreateForm({...createForm, name: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  className="input-field w-16 text-center text-xl" 
                  placeholder="🛒"
                  value={createForm.icon}
                  onChange={e => setCreateForm({...createForm, icon: e.target.value})}
                  maxLength={2}
                />
                <input 
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer shrink-0 bg-transparent py-1 px-1"
                  value={createForm.color}
                  onChange={e => setCreateForm({...createForm, color: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsCreating(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button onClick={handleCreateNew} className="flex-1 btn-primary text-sm">Save</button>
            </div>
          </div>
        )}

        {(Array.isArray(categories) ? categories : []).map((category) => (
          <BorderGlow
            key={category.id}
            className="w-full"
            edgeSensitivity={40}
            glowColor="270 80 70"
            backgroundColor="#0c0c14"
            borderRadius={18}
            glowRadius={25}
            glowIntensity={0.5}
            coneSpread={18}
            animated={false}
            colors={['#7c3aed']}
          >
            <div className="flex items-center justify-between px-5 py-4 w-full">

              {/* LEFT SIDE */}
              <div className="flex items-center gap-4">
                
                <div className="w-12 h-12 rounded-xl bg-[#1a1a2a] flex items-center justify-center">
                  <span className="text-2xl">{category.icon}</span>
                </div>

                <div>
                  <h3 className="text-base font-medium text-white truncate max-w-[120px]">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-400 number-font">
                    {category.transactionCount || 0} transactions
                  </p>
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-2">
                
                {/* Edit */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditClick(category); }}
                  className="w-9 h-9 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition flex items-center justify-center"
                  title="Edit category"
                >
                  <Pencil size={16} />
                </button>

                {/* Delete */}
                {!['Uncategorized'].includes(category.name) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(category); }}
                    className="w-9 h-9 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center"
                    title="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

              </div>

            </div>
          </BorderGlow>
        ))}
      </div>

      {showDeleteConfirm && categoryToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1E1E2E',
            border: '1px solid #2A2A3E',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#F0F0F8', marginBottom: '12px', fontSize: '20px' }}>
              Delete "{categoryToDelete.name}"?
            </h2>
            <p style={{ color: '#A0A0B8', marginBottom: '8px', fontSize: '14px' }}>
              This will delete the category permanently.
            </p>
            <p style={{ color: '#EF4444', marginBottom: '24px', fontSize: '13px' }}>
              All transactions in this category will be moved to "Uncategorized".
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setCategoryToDelete(null); }}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#A0A0B8',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: '#EF4444',
                  color: 'white', border: 'none',
                  borderRadius: '8px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                  opacity: deleting ? 0.7 : 1
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && categoryToEdit && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1E1E2E',
            border: '1px solid #2A2A3E',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '420px',
            width: '90%'
          }}>
            <h2 style={{ color: '#F0F0F8', marginBottom: '24px', fontSize: '20px' }}>Edit Category</h2>

            {/* Icon Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#A0A0B8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                Icon (emoji)
              </label>
              <input
                type="text"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                maxLength={2}
                style={{
                  width: '100%', padding: '10px 12px',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  color: '#F0F0F8', fontSize: '20px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#A0A0B8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                Category Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  color: '#F0F0F8', fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowEditModal(false); setCategoryToEdit(null); }}
                disabled={editing}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#A0A0B8',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEdit}
                disabled={editing || !editName.trim()}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: '#6C63FF',
                  color: 'white', border: 'none',
                  borderRadius: '8px',
                  cursor: editing ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                  opacity: editing ? 0.7 : 1
                }}
              >
                {editing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
