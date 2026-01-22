import React, { useState, useEffect } from 'react';
import { Save, Globe, MessageCircle, CreditCard, Search, Upload, Loader2, CheckCircle, Instagram, Facebook, Phone } from 'lucide-react';
import { api, SystemSettings } from '../../services/api';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState<'branding' | 'ai' | 'payment' | 'seo'>('branding');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await api.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            await api.updateSettings(settings);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !settings) return;

        try {
            const { url } = await api.uploadFile(file);
            setSettings({
                ...settings,
                payment: { ...settings.payment, qrCode: url }
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Tải ảnh thất bại');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!settings) return null;

    const tabs = [
        { id: 'branding', label: 'Thương hiệu', icon: Globe },
        { id: 'ai', label: 'AI Greeting', icon: MessageCircle },
        { id: 'payment', label: 'Thanh toán', icon: CreditCard },
        { id: 'seo', label: 'SEO', icon: Search },
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-charcoal">Cài đặt hệ thống</h1>
                    <p className="text-stone-500 text-sm">Quản lý cấu hình chung cho MEDE</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-charcoal text-white hover:bg-black'
                        }`}
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saveStatus === 'success' ? 'Đã lưu' : 'Lưu cài đặt'}
                </button>
            </div>

            <div className="flex gap-2 mb-8 bg-stone-100 p-1.5 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-charcoal shadow-sm' : 'text-stone-500 hover:text-charcoal'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 min-h-[400px]">
                {/* Branding Tab */}
                {activeTab === 'branding' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Facebook className="w-3 h-3" /> Facebook Page
                                </label>
                                <input
                                    type="text"
                                    value={settings.branding.facebook}
                                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, facebook: e.target.value } })}
                                    placeholder="https://facebook.com/mede"
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Instagram className="w-3 h-3" /> Instagram
                                </label>
                                <input
                                    type="text"
                                    value={settings.branding.instagram}
                                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, instagram: e.target.value } })}
                                    placeholder="https://instagram.com/mede"
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Phone className="w-3 h-3" /> Hotline
                            </label>
                            <input
                                type="text"
                                value={settings.branding.hotline}
                                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, hotline: e.target.value } })}
                                placeholder="0901234567"
                                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                )}

                {/* AI Tab */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">
                                Lời chào mặc định
                            </label>
                            <textarea
                                value={settings.ai.greeting}
                                onChange={(e) => setSettings({ ...settings, ai: { ...settings.ai, greeting: e.target.value } })}
                                rows={4}
                                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary resize-none"
                                placeholder="Xin chào!..."
                            />
                            <p className="mt-2 text-[10px] text-stone-400 italic">
                                * Lời chào này sẽ hiển thị lần đầu tiên khi người dùng mở khung chat AI.
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Tên ngân hàng</label>
                                <input
                                    type="text"
                                    value={settings.payment.bankName}
                                    onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, bankName: e.target.value } })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Số tài khoản</label>
                                <input
                                    type="text"
                                    value={settings.payment.accountNumber}
                                    onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, accountNumber: e.target.value } })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={settings.payment.accountHolder}
                                    onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, accountHolder: e.target.value.toUpperCase() } })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary uppercase transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Chi nhánh (Không bắt buộc)</label>
                                <input
                                    type="text"
                                    value={settings.payment.branch}
                                    onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, branch: e.target.value } })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Mã QR Thanh toán</label>
                            <div className="flex gap-4 items-start">
                                <div className="w-32 h-32 bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-200">
                                    {settings.payment.qrCode ? (
                                        <img src={settings.payment.qrCode.startsWith('http') ? settings.payment.qrCode : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${settings.payment.qrCode}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <CreditCard className="w-8 h-8 text-stone-300" />
                                    )}
                                </div>
                                <label className="cursor-pointer bg-white border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-2">
                                    <Upload className="w-3 h-3" /> Tải ảnh QR
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Nội dung chuyển khoản mặc định</label>
                            <input
                                type="text"
                                value={settings.payment.transferContent}
                                onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, transferContent: e.target.value } })}
                                placeholder="MEDE {orderId}"
                                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary"
                            />
                            <p className="mt-2 text-[10px] text-stone-400 italic">
                                * Sử dụng biếu tượng {"{orderId}"} để tự động điền mã đơn hàng.
                            </p>
                        </div>
                    </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">
                                Store Description (Meta Description)
                            </label>
                            <textarea
                                value={settings.seo.metaDescription}
                                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
                                rows={4}
                                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-charcoal focus:ring-1 focus:ring-primary resize-none"
                                placeholder="MEDE - Văn phòng phẩm xanh..."
                            />
                            <p className="mt-2 text-[10px] text-stone-400 italic">
                                * Mô tả này giúp công cụ tìm kiếm hiểu về nội dung cửa hàng của bạn.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
