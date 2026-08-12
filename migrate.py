import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
import_statement = """import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';\n"""
content = re.sub(r"(import \{ useState, useEffect, FormEvent \} from 'react';)", r"\1\n" + import_statement, content)

# 2. Update presence tracking
presence_tracking_old = """  // Presence Tracking
  useEffect(() => {
    if (user && user.role !== 'admin') {
      const updatePresence = () => {
        const savedAccountStr = localStorage.getItem(`futsar_account_${user.wa}`);
        if (savedAccountStr) {
          const acc = JSON.parse(savedAccountStr);
          acc.lastActive = Date.now();
          localStorage.setItem(`futsar_account_${user.wa}`, JSON.stringify(acc));
          localStorage.setItem('futsar_user', JSON.stringify(acc));
        }
      };
      
      updatePresence();
      const interval = setInterval(updatePresence, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);"""

presence_tracking_new = """  // Presence Tracking
  useEffect(() => {
    if (user && user.role !== 'admin' && user.wa) {
      const updatePresence = async () => {
        try {
          await updateDoc(doc(db, "users", user.wa), { lastActive: Date.now() });
        } catch (e) {
          console.error(e);
        }
      };
      
      updatePresence();
      const interval = setInterval(updatePresence, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.wa]);"""

content = content.replace(presence_tracking_old, presence_tracking_new)

# 3. Data Loading
data_loading_old = """  useEffect(() => {
    // Check local storage for logged in user on mount
    const savedUser = localStorage.getItem('futsar_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'admin') {
        const latestAccount = localStorage.getItem(`futsar_account_${parsedUser.wa}`);
        if (latestAccount) {
          setUser(JSON.parse(latestAccount));
          localStorage.setItem('futsar_user', latestAccount);
        } else {
          setUser(parsedUser);
        }
      } else {
        setUser(parsedUser);
      }
    }
    const savedSettings = localStorage.getItem('futsar_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ 
          ...defaultSettings, 
          ...parsed, 
          jadwalList: parsed.jadwalList || defaultSettings.jadwalList,
          announcements: parsed.announcements || defaultSettings.announcements 
        });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);"""

data_loading_new = """  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const parsed = docSnap.data() as AppSettings;
        setSettings({ 
          ...defaultSettings, 
          ...parsed, 
          jadwalList: parsed.jadwalList || defaultSettings.jadwalList,
          announcements: parsed.announcements || defaultSettings.announcements 
        });
      } else {
        setDoc(doc(db, "settings", "global"), defaultSettings);
      }
    });

    const savedWa = localStorage.getItem('futsar_user_wa');
    let unsubUser: () => void;
    if (savedWa && savedWa !== 'ADMIN') {
      unsubUser = onSnapshot(doc(db, "users", savedWa), (docSnap) => {
        if (docSnap.exists()) {
          setUser(docSnap.data() as User);
        } else {
          setUser(null);
          localStorage.removeItem('futsar_user_wa');
        }
        setIsLoaded(true);
      });
    } else if (savedWa === 'ADMIN') {
      const adminUser: User = {
        nama: 'Administrator',
        posisi: 'Admin',
        wa: 'ADMIN',
        id: 'ADMIN',
        role: 'admin'
      };
      setUser(adminUser);
      setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }

    return () => {
      unsubSettings();
      if (unsubUser) unsubUser();
    };
  }, []);"""

content = content.replace(data_loading_old, data_loading_new)

# 4. Fetch all users
fetch_all_users_old = """  const fetchAllUsers = () => {
    const users: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('futsar_account_')) {
        users.push(JSON.parse(localStorage.getItem(key)!));
      }
    }
    setAllUsers(users);
  };"""

fetch_all_users_new = """  const fetchAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: User[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as User);
    });
    setAllUsers(users);
  };"""

content = content.replace(fetch_all_users_old, fetch_all_users_new)

# 5. updateSettings
update_settings_old = """  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('futsar_settings', JSON.stringify(newSettings));
  };"""

update_settings_new = """  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await setDoc(doc(db, "settings", "global"), newSettings);
  };"""

content = content.replace(update_settings_old, update_settings_new)

# 6. handleRegister
register_old = """    // Save to local storage mock database
    localStorage.setItem(`futsar_account_${wa}`, JSON.stringify(newUser));
    
    // Auto login
    localStorage.setItem('futsar_user', JSON.stringify(newUser));
    setUser(newUser);
    setActiveModal(null);"""

register_new = """    // Save to Firestore
    setDoc(doc(db, "users", wa), newUser).then(() => {
      localStorage.setItem('futsar_user_wa', wa);
      setUser(newUser);
      setActiveModal(null);
    });"""

content = content.replace(register_old, register_new)
# change handleRegister to async is tricky without full function match, but we use .then above so it's fine.

# 7. handleLogin
login_old = """  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wa = formData.get('wa') as string;
    const password = formData.get('password') as string;

    const savedAccountStr = localStorage.getItem(`futsar_account_${wa}`);
    
    if (savedAccountStr) {
      const savedAccount = JSON.parse(savedAccountStr);
      if (savedAccount.password === password) {
        localStorage.setItem('futsar_user', JSON.stringify(savedAccount));
        setUser(savedAccount);
        setActiveModal(null);
        setLoginError(false);
        return;
      }
    }
    
    setLoginError(true);
    setTimeout(() => setLoginError(false), 400); // Reset shake animation
  };"""

login_new = """  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wa = formData.get('wa') as string;
    const password = formData.get('password') as string;

    const userDoc = await getDoc(doc(db, "users", wa));
    
    if (userDoc.exists()) {
      const savedAccount = userDoc.data() as User;
      if (savedAccount.password === password) {
        localStorage.setItem('futsar_user_wa', wa);
        setUser(savedAccount);
        setActiveModal(null);
        setLoginError(false);
        return;
      }
    }
    
    setLoginError(true);
    setTimeout(() => setLoginError(false), 400); // Reset shake animation
  };"""

content = content.replace(login_old, login_new)

# 8. handleAdminLogin
admin_login_old = """      const adminUser: User = {
        nama: 'Administrator',
        posisi: 'Admin',
        wa: validWa,
        id: 'ADMIN',
        role: 'admin'
      };
      localStorage.setItem('futsar_user', JSON.stringify(adminUser));
      setUser(adminUser);"""

admin_login_new = """      const adminUser: User = {
        nama: 'Administrator',
        posisi: 'Admin',
        wa: 'ADMIN',
        id: 'ADMIN',
        role: 'admin'
      };
      localStorage.setItem('futsar_user_wa', 'ADMIN');
      setUser(adminUser);"""

content = content.replace(admin_login_old, admin_login_new)

# 9. handleLogout
logout_old = """  const handleLogout = () => {
    localStorage.removeItem('futsar_user');
    setUser(null);
  };"""

logout_new = """  const handleLogout = () => {
    localStorage.removeItem('futsar_user_wa');
    setUser(null);
  };"""

content = content.replace(logout_old, logout_new)

# 10. handleUpdateProfile
update_profile_old = """  const handleUpdateProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const posisi = formData.get('posisi') as string;

    const updatedUser = { ...user, posisi };
    
    localStorage.setItem(`futsar_account_${user.wa}`, JSON.stringify(updatedUser));
    localStorage.setItem('futsar_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    alert('Profil berhasil diperbarui!');
    setActiveModal(null);
  };"""

update_profile_new = """  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const posisi = formData.get('posisi') as string;

    const updatedUser = { ...user, posisi };
    
    await updateDoc(doc(db, "users", user.wa), { posisi });
    // User state is updated via onSnapshot
    
    alert('Profil berhasil diperbarui!');
    setActiveModal(null);
  };"""

content = content.replace(update_profile_old, update_profile_new)

# 11. handleProfileAvatarUpload
avatar_old = """          const updatedUser = { ...user, avatarUrl: dataUrl };
          localStorage.setItem(`futsar_account_${user.wa}`, JSON.stringify(updatedUser));
          localStorage.setItem('futsar_user', JSON.stringify(updatedUser));
          setUser(updatedUser);"""

avatar_new = """          updateDoc(doc(db, "users", user.wa), { avatarUrl: dataUrl }).catch(console.error);"""

content = content.replace(avatar_old, avatar_new)

# 12. handleUploadGallery
gallery_old = """          const newSettings = { ...settings, gallery: [newPhoto, ...(settings.gallery || [])] };
          setSettings(newSettings);
          localStorage.setItem('futsar_settings', JSON.stringify(newSettings));"""

gallery_new = """          const newSettings = { ...settings, gallery: [newPhoto, ...(settings.gallery || [])] };
          updateSettings(newSettings);"""

content = content.replace(gallery_old, gallery_new)

# 13. handleDeleteGallery
delete_gallery_old = """  const handleDeleteGallery = (id: string) => {
    if (confirm('Yakin ingin menghapus foto ini?')) {
      const newGallery = (settings.gallery || []).filter((p) => p.id !== id);
      const newSettings = { ...settings, gallery: newGallery };
      setSettings(newSettings);
      localStorage.setItem('futsar_settings', JSON.stringify(newSettings));
    }
  };"""

delete_gallery_new = """  const handleDeleteGallery = (id: string) => {
    if (confirm('Yakin ingin menghapus foto ini?')) {
      const newGallery = (settings.gallery || []).filter((p) => p.id !== id);
      const newSettings = { ...settings, gallery: newGallery };
      updateSettings(newSettings);
    }
  };"""

content = content.replace(delete_gallery_old, delete_gallery_new)

# 14. handleUpdatePaymentCycle
payment_cycle_old = """  const handleUpdatePaymentCycle = (cycle: 'mingguan' | 'bulanan') => {
    if (!user) return;
    const updatedUser = { ...user, paymentCycle: cycle };
    setUser(updatedUser);
    localStorage.setItem('futsar_user', JSON.stringify(updatedUser));
    const savedAccounts = localStorage.getItem(`futsar_account_${user.wa}`);
    if (savedAccounts) {
      const acc = JSON.parse(savedAccounts);
      localStorage.setItem(`futsar_account_${user.wa}`, JSON.stringify({ ...acc, paymentCycle: cycle }));
    }
  };"""

payment_cycle_new = """  const handleUpdatePaymentCycle = (cycle: 'mingguan' | 'bulanan') => {
    if (!user) return;
    updateDoc(doc(db, "users", user.wa), { paymentCycle: cycle }).catch(console.error);
  };"""

content = content.replace(payment_cycle_old, payment_cycle_new)

# AdminDashboard Component Changes
# Find AdminDashboard implementation
admin_load_users_old = """  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    const pUsers: User[] = [];
    const aUsers: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('futsar_account_')) {
        const u = JSON.parse(localStorage.getItem(key)!);
        if (u.status === 'pending') {
          pUsers.push(u);
        } else if (u.status === 'active') {
          aUsers.push(u);
        }
      }
    }
    setPendingUsers(pUsers);
    setActiveUsers(aUsers);
  }"""

admin_load_users_new = """  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const pUsers: User[] = [];
      const aUsers: User[] = [];
      snapshot.forEach(docSnap => {
        const u = docSnap.data() as User;
        if (u.status === 'pending') {
          pUsers.push(u);
        } else if (u.status === 'active') {
          aUsers.push(u);
        }
      });
      setPendingUsers(pUsers);
      setActiveUsers(aUsers);
    });
    return () => unsub();
  }, []);"""

content = content.replace(admin_load_users_old, admin_load_users_new)

# Admin approve
admin_approve_old = """  const handleApprove = (wa: string) => {
    const key = `futsar_account_${wa}`;
    const uStr = localStorage.getItem(key);
    if (uStr) {
      const u = JSON.parse(uStr);
      u.status = 'active';
      localStorage.setItem(key, JSON.stringify(u));
      loadUsers();
    }
  };"""

admin_approve_new = """  const handleApprove = async (wa: string) => {
    await updateDoc(doc(db, "users", wa), { status: 'active' });
  };"""

content = content.replace(admin_approve_old, admin_approve_new)

# Admin reject
admin_reject_old = """  const handleReject = (wa: string) => {
    const key = `futsar_account_${wa}`;
    const uStr = localStorage.getItem(key);
    if (uStr) {
      const u = JSON.parse(uStr);
      u.status = 'rejected';
      localStorage.setItem(key, JSON.stringify(u));
      loadUsers();
    }
  };"""

admin_reject_new = """  const handleReject = async (wa: string) => {
    await updateDoc(doc(db, "users", wa), { status: 'rejected' });
  };"""

content = content.replace(admin_reject_old, admin_reject_new)

# Admin toggle payment
admin_payment_old = """  const handleTogglePayment = (wa: string, currentStatus: boolean) => {
    const key = `futsar_account_${wa}`;
    const uStr = localStorage.getItem(key);
    if (uStr) {
      const u = JSON.parse(uStr);
      u.isPaid = !currentStatus;
      u.lastPaymentDate = !currentStatus ? new Date().toISOString() : null;
      localStorage.setItem(key, JSON.stringify(u));
      loadUsers();
    }
  };"""

admin_payment_new = """  const handleTogglePayment = async (wa: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "users", wa), { 
      isPaid: !currentStatus, 
      lastPaymentDate: !currentStatus ? new Date().toISOString() : null 
    });
  };"""

content = content.replace(admin_payment_old, admin_payment_new)

# Admin Delete Account
admin_delete_old = """                          if (confirm(`Yakin ingin menghapus akun ${u.nama}?`)) {
                            localStorage.removeItem(`futsar_account_${u.wa}`);
                            loadUsers();
                          }"""

admin_delete_new = """                          if (confirm(`Yakin ingin menghapus akun ${u.nama}?`)) {
                            deleteDoc(doc(db, "users", u.wa));
                          }"""

content = content.replace(admin_delete_old, admin_delete_new)


with open('app/page.tsx', 'w') as f:
    f.write(content)
