import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/router';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { HOSTELS, getHostelDisplay } from '../src/constants/hostels';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    photoURL: '',
    gender: '',
    age: '',
    occupation: '',
    hostel: '',
    preferences: { moveInDate: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Current user:', user);
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, 'roomie-users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setForm({
            name: data.name || '',
            bio: data.bio || '',
            photoURL: data.photoURL || '',
            gender: data.gender || '',
            age: data.age || '',
            occupation: data.occupation || '',
            hostel: data.hostel || '',
            preferences: {
              moveInDate: data.moveInDate || ''
            }
          });
          console.log('Fetched profile form:', {
            name: data.name || '',
            bio: data.bio || '',
            photoURL: data.photoURL || '',
            gender: data.gender || '',
            age: data.age || '',
            occupation: data.occupation || '',
            hostel: data.hostel || '',
            preferences: {
              moveInDate: data.moveInDate || ''
            }
          });
        }
      } catch (e) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      setForm((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name.split('.')[1]]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const userRef = doc(db, 'roomie-users', user.uid);
      await updateDoc(userRef, {
        name: form.name,
        bio: form.bio,
        photoURL: form.photoURL,
        gender: form.gender,
        age: form.age,
        occupation: form.occupation,
        hostel: form.hostel,
        preferences: {
          ...form.preferences
        },
        moveInDate: form.preferences.moveInDate
      });
      setSuccess(true);
    } catch (e) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <div className="bg-gray-900/90 rounded-2xl shadow-2xl p-8 border border-pink-700/30 text-center">
          <h2 className="text-2xl font-bold text-pink-400 mb-4">You are not logged in</h2>
          <p className="text-pink-200 mb-6">Please log in to view and update your profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <div className="text-white text-xl animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-gray-900/90 rounded-2xl shadow-2xl p-8 border border-pink-700/30">
        <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center">Update Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center mb-4">
            {form.photoURL ? (
              <img
                src={form.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-pink-500 object-cover mb-2 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-pink-500 bg-gray-700 flex items-center justify-center mb-2 shadow-lg text-3xl text-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <label className="block text-pink-200 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-pink-200 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Tell us about yourself..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-pink-200 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-pink-200 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                min="16"
                max="100"
              />
            </div>
            <div>
              <label className="block text-pink-200 mb-1">Hostel</label>
              <select
                name="hostel"
                value={form.hostel}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select your hostel</option>
                {form.gender === 'male' && (
                  <>
                    <optgroup label="🏳️‍♂️ BOYS HOSTELS">
                      {HOSTELS.BOYS.map((hostel) => (
                        <option key={hostel.code} value={hostel.code}>
                          {hostel.name} ({hostel.code})
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
                {form.gender === 'female' && (
                  <>
                    <optgroup label="🏳️‍♀️ GIRLS HOSTELS">
                      {HOSTELS.GIRLS.map((hostel) => (
                        <option key={hostel.code} value={hostel.code}>
                          {hostel.name} ({hostel.code})
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-pink-200 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-pink-200 mb-1">Move-in Date</label>
              <input
                type="date"
                name="preferences.moveInDate"
                value={form.preferences.moveInDate}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          {error && <div className="text-red-400 text-center">{error}</div>}
          {success && <div className="text-green-400 text-center">Profile updated successfully!</div>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <button
          onClick={() => router.push('/')}
          className="w-full mt-4 py-2 bg-gray-800 text-pink-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 