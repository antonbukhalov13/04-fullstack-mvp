'use client';

import { useEffect, useState } from 'react';
import { apiRequest, ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Spinner } from '@/shared/ui/spinner';

interface AdminUser {
  id: string;
  login: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

interface CurrentAdmin {
  id: string;
  login: string;
  role: string;
}

type Role = 'admin' | 'operator';

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as Record<string, unknown>;
    if (Array.isArray(body?.message)) return String(body.message[0]);
    if (typeof body?.message === 'string') return body.message;
  }
  return fallback;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminUsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addLogin, setAddLogin] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<Role>('operator');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [passwordEditId, setPasswordEditId] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{ data: AdminUser[] }>('/admin-users', {
        admin: true,
      });
      setUsers(data.data);
    } catch (err) {
      setError(errorMessage(err, 'Не удалось загрузить список администраторов'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const raw = localStorage.getItem('admin_user');
    if (raw) {
      try {
        const admin = JSON.parse(raw) as CurrentAdmin;
        setCurrentAdminId(admin.id);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleCreate = async () => {
    if (!addLogin.trim() || !addPassword.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      await apiRequest<AdminUser>('/admin-users', {
        method: 'POST',
        admin: true,
        body: {
          login: addLogin.trim(),
          password: addPassword.trim(),
          role: addRole,
        },
      });
      setShowAddForm(false);
      setAddLogin('');
      setAddPassword('');
      setAddRole('operator');
      await fetchUsers();
    } catch (err) {
      setAddError(errorMessage(err, 'Не удалось создать администратора'));
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (user: AdminUser, role: Role) => {
    if (role === user.role) return;
    setRoleUpdatingId(user.id);
    try {
      await apiRequest<AdminUser>(`/admin-users/${user.id}`, {
        method: 'PATCH',
        admin: true,
        body: { role },
      });
      await fetchUsers();
    } catch (err) {
      setError(errorMessage(err, 'Не удалось изменить роль'));
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handlePasswordSave = async (userId: string) => {
    if (!passwordValue.trim()) return;
    setSavingPassword(true);
    setPasswordError(null);
    try {
      await apiRequest<AdminUser>(`/admin-users/${userId}`, {
        method: 'PATCH',
        admin: true,
        body: { password: passwordValue.trim() },
      });
      setPasswordEditId(null);
      setPasswordValue('');
    } catch (err) {
      setPasswordError(errorMessage(err, 'Не удалось изменить пароль'));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Удалить учётную запись «${user.login}»?`)) return;
    setDeletingId(user.id);
    try {
      await apiRequest<{ success: boolean }>(`/admin-users/${user.id}`, {
        method: 'DELETE',
        admin: true,
      });
      await fetchUsers();
    } catch (err) {
      setError(errorMessage(err, 'Не удалось удалить администратора'));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Отмена' : 'Добавить администратора'}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4 max-w-md">
          <h2 className="text-sm font-semibold text-slate-700">Новая учётная запись</h2>
          <Input
            label="Логин"
            value={addLogin}
            onChange={(e) => setAddLogin(e.target.value)}
            placeholder="Например: operator2"
            maxLength={50}
          />
          <Input
            label="Пароль"
            type="password"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            placeholder="Минимум 6 символов"
            minLength={6}
            maxLength={72}
          />
          <Select
            label="Роль"
            value={addRole}
            onChange={(e) => setAddRole(e.target.value as Role)}
          >
            <option value="admin">admin</option>
            <option value="operator">operator</option>
          </Select>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <Button
            onClick={handleCreate}
            loading={adding}
            disabled={!addLogin.trim() || !addPassword.trim() || adding}
          >
            Создать
          </Button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="py-20 text-center text-sm text-slate-500">Учётных записей нет.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Логин</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Создан</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => {
                const isSelf = u.id === currentAdminId;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors align-middle">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {u.login}
                      {isSelf && (
                        <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
                          это вы
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-40">
                        <Select
                          value={u.role}
                          disabled={isSelf || roleUpdatingId === u.id}
                          onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                          className="!min-h-[38px] !py-1.5 text-sm"
                        >
                          <option value="admin">admin</option>
                          <option value="operator">operator</option>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {passwordEditId === u.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              value={passwordValue}
                              onChange={(e) => setPasswordValue(e.target.value)}
                              placeholder="Новый пароль"
                              minLength={6}
                              maxLength={72}
                              className="w-44"
                            />
                            <Button
                              size="sm"
                              loading={savingPassword}
                              disabled={!passwordValue.trim() || savingPassword}
                              onClick={() => handlePasswordSave(u.id)}
                            >
                              Сохранить
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPasswordEditId(null);
                                setPasswordValue('');
                                setPasswordError(null);
                              }}
                            >
                              Отмена
                            </Button>
                            {passwordError && (
                              <span className="text-xs text-red-600">{passwordError}</span>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setPasswordEditId(u.id);
                              setPasswordValue('');
                              setPasswordError(null);
                            }}
                          >
                            Пароль
                          </Button>
                        )}
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="danger"
                            loading={deletingId === u.id}
                            disabled={deletingId === u.id}
                            onClick={() => handleDelete(u)}
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
