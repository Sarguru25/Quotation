"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Plus, Edit, Trash2, Check, Loader2 } from "lucide-react";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useRouter } from "next/navigation";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // For creating/editing role name
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (data.length > 0 && !selectedRole) {
          setSelectedRole(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch roles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName) return alert("Role name required");
    try {
      setSaving(true);
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName, description: newRoleDesc, permissions: [] }),
      });
      if (res.ok) {
        setIsCreating(false);
        setNewRoleName("");
        setNewRoleDesc("");
        fetchRoles();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create role");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedRole?._id === id) setSelectedRole(null);
        fetchRoles();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete role");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePermission = (permissionValue) => {
    if (!selectedRole) return;
    
    let updatedPermissions = [...selectedRole.permissions];
    if (updatedPermissions.includes(permissionValue)) {
      updatedPermissions = updatedPermissions.filter(p => p !== permissionValue);
    } else {
      updatedPermissions.push(permissionValue);
    }
    
    // Optimistic update locally
    setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
  };

  const handleToggleAllPermissions = (modulePerms, isAllSelected) => {
    if (!selectedRole) return;
    let updatedPermissions = [...selectedRole.permissions];
    const permValues = Object.values(modulePerms);
    
    if (isAllSelected) {
      // Remove all
      updatedPermissions = updatedPermissions.filter(p => !permValues.includes(p));
    } else {
      // Add all
      permValues.forEach(p => {
        if (!updatedPermissions.includes(p)) updatedPermissions.push(p);
      });
    }
    setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/roles/${selectedRole._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: selectedRole.permissions }),
      });
      if (res.ok) {
        alert("Permissions saved successfully!");
        fetchRoles();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save permissions");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system roles and their permissions</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus size={16} />
          Create Role
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Role Name</label>
            <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Sales Lead" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional description" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateRole} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Save</button>
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roles List */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[70vh]">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Available Roles</h3>
          </div>
          <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {roles.map(role => (
              <li 
                key={role._id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRole?._id === role._id ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{role.name}</span>
                  {!role.isSystemRole && (
                    <div className="flex gap-2">
                      <button onClick={(e) => handleDeleteRole(role._id, e)} className="text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                <div className="mt-2 text-xs text-indigo-600 bg-indigo-100 inline-block px-2 py-0.5 rounded-full font-medium">
                  {role.permissions.includes("*") ? "All Permissions" : `${role.permissions.length} Permissions`}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Permissions Matrix */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm h-[70vh] flex flex-col">
          {selectedRole ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="text-indigo-600" size={20} />
                  Permissions: {selectedRole.name}
                </h3>
                <button 
                  onClick={savePermissions} 
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {Object.entries(PERMISSIONS).map(([moduleName, modulePerms]) => {
                  const permValues = Object.values(modulePerms);
                  const isAllSelected = permValues.every(p => selectedRole.permissions.includes(p) || selectedRole.permissions.includes("*"));
                  
                  return (
                    <div key={moduleName} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                        <h4 className="font-semibold text-gray-800 capitalize">{moduleName.toLowerCase()}</h4>
                        <button 
                          onClick={() => handleToggleAllPermissions(modulePerms, isAllSelected)}
                          className="text-xs text-indigo-600 font-medium hover:underline"
                        >
                          {isAllSelected ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(modulePerms).map(([actionName, permValue]) => {
                          const hasPerm = selectedRole.permissions.includes("*") || selectedRole.permissions.includes(permValue);
                          return (
                            <label key={permValue} className="flex items-center gap-2 cursor-pointer group">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasPerm ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300 group-hover:border-indigo-400'}`}>
                                {hasPerm && <Check size={14} className="text-white" />}
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={hasPerm}
                                onChange={() => handleTogglePermission(permValue)}
                              />
                              <span className="text-sm text-gray-700 capitalize">{actionName.replace(/_/g, ' ').toLowerCase()}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShieldAlert size={48} className="mb-4 text-gray-300" />
              <p>Select a role to view or edit permissions</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
