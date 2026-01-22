import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, Save, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

type Tab = 'profile' | 'password';

interface Province {
    code: number;
    name: string;
}

interface District {
    code: number;
    name: string;
}

interface Ward {
    code: number;
    name: string;
}

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profile form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Address data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setCity(user.city || '');
            setDistrict(user.district || '');
            setWard(user.ward || '');
        }
    }, [user]);

    // Fetch provinces
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(() => { });
    }, []);

    // Fetch districts when city changes
    useEffect(() => {
        if (city) {
            const province = provinces.find(p => p.name === city);
            if (province) {
                fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
                    .then(res => res.json())
                    .then(data => {
                        setDistricts(data.districts || []);
                        setWards([]);
                    })
                    .catch(() => { });
            }
        } else {
            setDistricts([]);
            setWards([]);
            setDistrict('');
            setWard('');
        }
    }, [city, provinces]);

    // Fetch wards when district changes
    useEffect(() => {
        if (district) {
            const dist = districts.find(d => d.name === district);
            if (dist) {
                fetch(`https://provinces.open-api.vn/api/d/${dist.code}?depth=2`)
                    .then(res => res.json())
                    .then(data => setWards(data.wards || []))
                    .catch(() => { });
            }
        } else {
            setWards([]);
            setWard('');
        }
    }, [district, districts]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.updateProfile({ name, phone, address, city, district, ward });
            setSuccess('Cập nhật thông tin thành công!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            setIsLoading(false);
            return;
        }

        try {
            await api.updatePassword(currentPassword, newPassword);
            setSuccess('Đổi mật khẩu thành công!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-[900px] mx-auto px-6 py-10">
            <h1 className="font-display text-3xl font-bold text-charcoal mb-8">Cài đặt</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-stone-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${activeTab === 'profile'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-charcoal/60 hover:text-charcoal'
                        }`}
                >
                    <User className="w-5 h-5" />
                    Thông tin cá nhân
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${activeTab === 'password'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-charcoal/60 hover:text-charcoal'
                        }`}
                >
                    <Lock className="w-5 h-5" />
                    Đổi mật khẩu
                </button>
            </div>

            {/* Notifications */}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Họ tên</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none"
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none"
                                placeholder="Số nhà, tên đường..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">Tỉnh/Thành</label>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none appearance-none bg-white"
                                >
                                    <option value="">Chọn tỉnh thành</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">Quận/Huyện</label>
                                <select
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none appearance-none bg-white"
                                    disabled={!city}
                                >
                                    <option value="">Chọn quận huyện</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">Phường/Xã</label>
                                <select
                                    value={ward}
                                    onChange={(e) => setWard(e.target.value)}
                                    className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none appearance-none bg-white"
                                    disabled={!district}
                                >
                                    <option value="">Chọn phường xã</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.name}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Lưu thay đổi
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none"
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-charcoal/60 mt-1">Tối thiểu 6 ký tự</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-2xl p-4 border border-stone-200 focus:border-primary focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" /> Đổi mật khẩu
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
