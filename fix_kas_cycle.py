import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update AppSettings
old_settings = """type AppSettings = {
  kasMingguan: number;
  kasBulanan: number;
  jadwalList: Schedule[];"""

new_settings = """type AppSettings = {
  activePaymentCycle?: 'mingguan' | 'bulanan';
  kasMingguan: number;
  kasBulanan: number;
  jadwalList: Schedule[];"""

content = content.replace(old_settings, new_settings)

old_default = """const defaultSettings: AppSettings = {
  kasMingguan: 20000,
  kasBulanan: 80000,"""

new_default = """const defaultSettings: AppSettings = {
  activePaymentCycle: 'mingguan',
  kasMingguan: 20000,
  kasBulanan: 80000,"""

content = content.replace(old_default, new_default)

# 2. Update getNextDueDate
old_get_next = """  const getNextDueDate = (userData: User) => {
    const date = userData.lastPaymentDate ? new Date(userData.lastPaymentDate) : new Date();
    if (userData.paymentCycle === 'bulanan') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };"""

new_get_next = """  const getNextDueDate = (userData: User) => {
    const date = userData.lastPaymentDate ? new Date(userData.lastPaymentDate) : new Date();
    const cycle = settings.activePaymentCycle || 'mingguan';
    if (cycle === 'bulanan') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };"""

content = content.replace(old_get_next, new_get_next)

old_get_days = """  const getDaysRemaining = (userData: User) => {
    if (!userData.lastPaymentDate || !userData.isPaid) return 0;
    const lastPayDate = new Date(userData.lastPaymentDate);
    const dueDate = new Date(lastPayDate);
    if (userData.paymentCycle === 'bulanan') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else {
      dueDate.setDate(dueDate.getDate() + 7);
    }
    const today = new Date();
    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };"""

new_get_days = """  const getDaysRemaining = (userData: User) => {
    if (!userData.lastPaymentDate || !userData.isPaid) return 0;
    const lastPayDate = new Date(userData.lastPaymentDate);
    const dueDate = new Date(lastPayDate);
    const cycle = settings.activePaymentCycle || 'mingguan';
    if (cycle === 'bulanan') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else {
      dueDate.setDate(dueDate.getDate() + 7);
    }
    const today = new Date();
    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };"""

content = content.replace(old_get_days, new_get_days)

with open('app/page.tsx', 'w') as f:
    f.write(content)
