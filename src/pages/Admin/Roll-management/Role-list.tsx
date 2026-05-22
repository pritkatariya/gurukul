import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaUserShield } from "react-icons/fa";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";
import { handleRoleDelete } from "../../../Action/Roles/delete.ts";
import {
    fetchRoleForEdit,
    updateRoleById,
    type RoleEditPayload,
} from "../../../Action/Roles/edit.ts";

interface RoleType {
    id: string | number;
    img: string | null;
    name: string;
    role: string;
    dept: string;
    date: string;
    status: string;
}

type PermissionState = {
    role: { create: boolean; view: boolean };
    user: { create: boolean; view: boolean };
    overview: { manage: boolean; music: boolean; editor: boolean };
};

type ViewRoleState = {
    id: string | number;
    role_name: string;
    role_code: string;
    created_date?: string;
    permissions: PermissionState;
};

const defaultPermissions: PermissionState = {
    role: { create: false, view: false },
    user: { create: false, view: false },
    overview: { manage: false, music: false, editor: false },
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const normalizePermissions = (permissions: any): PermissionState => {
    const parsed =
        typeof permissions === "string"
            ? (() => {
                  try {
                      return JSON.parse(permissions);
                  } catch {
                      return {};
                  }
              })()
            : permissions || {};

    return {
        role: {
            create: Boolean(parsed?.role?.create),
            view: Boolean(parsed?.role?.view),
        },
        user: {
            create: Boolean(parsed?.user?.create),
            view: Boolean(parsed?.user?.view),
        },
        overview: {
            manage: Boolean(parsed?.overview?.manage),
            music: Boolean(parsed?.overview?.music),
            editor: Boolean(parsed?.overview?.editor),
        },
    };
};

const getAccessLevel = (permissions: PermissionState) => {
    const allValues = [
        ...Object.values(permissions.role),
        ...Object.values(permissions.user),
        ...Object.values(permissions.overview),
    ];

    if (allValues.every(Boolean)) return "Full System Access";
    if (allValues.every((value) => !value)) return "View Only Access";
    return "Custom Access Configured";
};

export default function RoleList() {
    const [roleData, setRoleData] = useState<RoleType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [viewOpen, setViewOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [viewRole, setViewRole] = useState<ViewRoleState | null>(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editRoleId, setEditRoleId] = useState<string | number | null>(null);
    const [editRoleName, setEditRoleName] = useState("");
    const [editRoleCode, setEditRoleCode] = useState("");
    const [editPermissions, setEditPermissions] = useState<PermissionState>(defaultPermissions);

    const roleHeaders = [
        "Profile",
        "Role Name",
        "Access Level",
        "Role Code",
        "Created Date",
        "Status",
    ];

    const fetchRoles = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/auth/role/alldata`);
            const data = await response.json();

            if (!response.ok || !data.success || !data.roles) {
                throw new Error(data.message || "Failed to load roles from database");
            }

            const formattedRoles = data.roles.map((role: any) => {
                const permissions = normalizePermissions(role.permissions);

                return {
                    id: role.id || role.role_code,
                    img: null,
                    name: role.role_name,
                    role: getAccessLevel(permissions),
                    dept: role.role_code,
                    date: role.created_date || "-",
                    status: "Active",
                };
            });

            setRoleData(formattedRoles);
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Database Server is offline or unreachable");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const openViewModal = async (id: number | string) => {
        try {
            setViewLoading(true);
            setViewOpen(true);
            setViewRole(null);

            const role = await fetchRoleForEdit(id);

            if (!role) {
                setViewOpen(false);
                return;
            }

            setViewRole({
                id: role.id,
                role_name: role.role_name || "",
                role_code: role.role_code || "",
                created_date: role.created_date || "-",
                permissions: normalizePermissions(role.permissions),
            });
        } finally {
            setViewLoading(false);
        }
    };

    const closeViewModal = () => {
        setViewOpen(false);
        setViewRole(null);
    };

    const openEditModal = async (id: number | string) => {
        try {
            setEditLoading(true);
            setEditOpen(true);
            setEditRoleId(id);

            const role = await fetchRoleForEdit(id);

            if (!role) {
                setEditOpen(false);
                return;
            }

            setEditRoleName(role.role_name || "");
            setEditRoleCode(role.role_code || "");
            setEditPermissions(normalizePermissions(role.permissions));
        } finally {
            setEditLoading(false);
        }
    };

    const closeEditModal = () => {
        if (savingEdit) return;

        setEditOpen(false);
        setEditRoleId(null);
        setEditRoleName("");
        setEditRoleCode("");
        setEditPermissions(defaultPermissions);
    };

    const handlePermissionChange = (module: keyof PermissionState, key: string) => {
        setEditPermissions((prev) => ({
            ...prev,
            [module]: {
                ...prev[module],
                [key]: !prev[module][key as keyof PermissionState[typeof module]],
            },
        }));
    };

    const editAllSelected =
        Object.values(editPermissions.role).every(Boolean) &&
        Object.values(editPermissions.user).every(Boolean) &&
        Object.values(editPermissions.overview).every(Boolean);

    const handleEditSelectAll = () => {
        const next = !editAllSelected;

        setEditPermissions({
            role: { create: next, view: next },
            user: { create: next, view: next },
            overview: { manage: next, music: next, editor: next },
        });
    };

    const handleEditSave = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!editRoleId) return;

        if (!editRoleName.trim() || !editRoleCode.trim()) {
            toast.error("Please fill Role Name and Role Code");
            return;
        }

        try {
            setSavingEdit(true);

            const payload: RoleEditPayload = {
                roleName: editRoleName.trim(),
                roleCode: editRoleCode.trim(),
                permissions: editPermissions,
            };

            const updatedRole = await updateRoleById(editRoleId, payload);

            if (!updatedRole) return;

            closeEditModal();
            fetchRoles();
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-10 select-none flex flex-col gap-6">
            <div className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-red-950 uppercase tracking-tight flex items-center gap-3">
                        <span className="p-2.5 bg-red-50 text-red-800 rounded-2xl shadow-inner">
                            <FaUserShield size={24} />
                        </span>
                        Roles & Permissions
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-1">
                        Manage access levels, configurations and view assignments for core active roles.
                    </p>
                </div>
                <div className="h-1.5 w-12 bg-red-800 rounded-full hidden sm:block" />
            </div>

            <div className="w-full bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.025)] border border-gray-100 min-h-87.5 flex flex-col justify-center overflow-visible p-2">
                {loading ? (
                    <div className="flex flex-col items-center gap-3 text-gray-400 font-bold animate-pulse py-20">
                        <div className="w-9 h-9 border-4 border-red-800 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs uppercase tracking-wider text-red-900/60">
                            Loading Database...
                        </span>
                    </div>
                ) : roleData.length === 0 ? (
                    <div className="text-gray-400 font-bold py-20 text-center uppercase text-xs tracking-wider">
                        No system roles found in the database.
                    </div>
                ) : (
                    <div className="w-full overflow-visible pb-24">
                        <DataExplorer
                            headers={roleHeaders}
                            data={roleData}
                            onView={(id) => openViewModal(id)}
                            onEdit={(id) => openEditModal(id)}
                            onDelete={(id) => handleRoleDelete(id, fetchRoles)}
                        />
                    </div>
                )}
            </div>

            {viewOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl border border-red-50">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-700">
                                    View Role
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-red-950">
                                    Role Details & Permissions
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeViewModal}
                                className="h-10 rounded-xl border border-red-100 px-4 text-sm font-black text-red-800 transition hover:bg-red-50"
                            >
                                Close
                            </button>
                        </div>

                        {viewLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-red-800 border-t-transparent" />
                                <p className="text-xs font-black uppercase tracking-wider text-red-900/60">
                                    Loading role details...
                                </p>
                            </div>
                        ) : viewRole ? (
                            <div className="grid gap-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InfoBox label="Role ID" value={String(viewRole.id)} />
                                    <InfoBox label="Status" value="Active" />
                                    <InfoBox label="Role Name" value={viewRole.role_name} />
                                    <InfoBox label="Role Code" value={viewRole.role_code} />
                                    <InfoBox label="Created Date" value={viewRole.created_date || "-"} />
                                    <InfoBox label="Access Level" value={getAccessLevel(viewRole.permissions)} />
                                </div>

                                <div className="rounded-2xl border border-red-50 p-5">
                                    <h3 className="mb-4 text-sm font-black uppercase text-red-950">
                                        Permission Details
                                    </h3>

                                    <div className="grid gap-3">
                                        <PermissionViewRow
                                            title="Role Permission"
                                            permissions={[
                                                ["Create Role", viewRole.permissions.role.create],
                                                ["View Role", viewRole.permissions.role.view],
                                            ]}
                                        />

                                        <PermissionViewRow
                                            title="User / Sevak Permission"
                                            permissions={[
                                                ["Create User", viewRole.permissions.user.create],
                                                ["View User", viewRole.permissions.user.view],
                                            ]}
                                        />

                                        <PermissionViewRow
                                            title="Overview Controller"
                                            permissions={[
                                                ["Manage Overview", viewRole.permissions.overview.manage],
                                                ["Music Tracks", viewRole.permissions.overview.music],
                                                ["Event Editor", viewRole.permissions.overview.editor],
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-16 text-center text-xs font-black uppercase tracking-wider text-gray-400">
                                Role details not found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {editOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl border border-red-50">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-700">
                                    Edit Role
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-red-950">
                                    Update Role & Permissions
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={savingEdit}
                                className="h-10 rounded-xl border border-red-100 px-4 text-sm font-black text-red-800 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                Close
                            </button>
                        </div>

                        {editLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16">
                                <div className="h-9 w-9 animate-spin rounded-full border-4 border-red-800 border-t-transparent" />
                                <p className="text-xs font-black uppercase tracking-wider text-red-900/60">
                                    Loading role...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleEditSave} className="grid gap-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <label className="grid gap-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-red-900">
                                            Role Name
                                        </span>
                                        <input
                                            value={editRoleName}
                                            onChange={(event) => setEditRoleName(event.target.value)}
                                            className="h-12 rounded-2xl border border-red-100 bg-white px-4 text-sm font-bold text-red-950 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                                            placeholder="Role Name"
                                        />
                                    </label>

                                    <label className="grid gap-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-red-900">
                                            Role Code
                                        </span>
                                        <input
                                            value={editRoleCode}
                                            onChange={(event) => setEditRoleCode(event.target.value)}
                                            className="h-12 rounded-2xl border border-red-100 bg-white px-4 text-sm font-bold text-red-950 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                                            placeholder="Role Code"
                                        />
                                    </label>
                                </div>

                                <div className="rounded-2xl border border-red-50 p-5">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-black uppercase text-red-950">
                                            Permissions Management
                                        </h3>

                                        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-red-800 px-3 py-1 text-[10px] font-black text-white transition hover:bg-red-900">
                                            <input
                                                type="checkbox"
                                                className="accent-white"
                                                checked={editAllSelected}
                                                onChange={handleEditSelectAll}
                                            />
                                            Select All
                                        </label>
                                    </div>

                                    <div className="grid gap-3">
                                        <PermissionRow
                                            title="Role Permission"
                                            module="role"
                                            items={["create", "view"]}
                                            permissions={editPermissions}
                                            onChange={handlePermissionChange}
                                        />

                                        <PermissionRow
                                            title="User / Sevak Permission"
                                            module="user"
                                            items={["create", "view"]}
                                            permissions={editPermissions}
                                            onChange={handlePermissionChange}
                                        />

                                        <PermissionRow
                                            title="Overview Controller"
                                            module="overview"
                                            items={["manage", "music", "editor"]}
                                            permissions={editPermissions}
                                            onChange={handlePermissionChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="h-13 rounded-2xl bg-red-800 text-sm font-black text-white transition hover:bg-red-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {savingEdit ? "SAVING..." : "SAVE CHANGES"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-2 break-words text-sm font-black text-red-950">{value}</p>
        </div>
    );
}

function PermissionViewRow({
    title,
    permissions,
}: {
    title: string;
    permissions: Array<[string, boolean]>;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 p-4">
            <h4 className="mb-3 text-sm font-black text-red-950">{title}</h4>

            <div className="flex flex-wrap gap-2">
                {permissions.map(([label, active]) => (
                    <span
                        key={label}
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                            active
                                ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                                : "bg-red-50 text-red-700 ring-1 ring-red-100"
                        }`}
                    >
                        {label}: {active ? "Allowed" : "Denied"}
                    </span>
                ))}
            </div>
        </div>
    );
}

function PermissionRow({
    title,
    module,
    items,
    permissions,
    onChange,
}: {
    title: string;
    module: keyof PermissionState;
    items: string[];
    permissions: PermissionState;
    onChange: (module: keyof PermissionState, key: string) => void;
}) {
    return (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center">
            <div>
                <h2 className="text-sm font-black text-red-950">{title}</h2>
            </div>

            <div className="flex flex-wrap gap-5">
                {items.map((item) => (
                    <label key={item} className="flex cursor-pointer items-center gap-2 capitalize">
                        <input
                            type="checkbox"
                            className="h-4 w-4 accent-red-800"
                            checked={Boolean((permissions[module] as any)[item])}
                            onChange={() => onChange(module, item)}
                        />
                        <span className="text-sm font-bold text-gray-600">
                            {item
                                .replace("manage", "Manage Overview")
                                .replace("music", "Music Tracks")
                                .replace("editor", "Event Editor")}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}