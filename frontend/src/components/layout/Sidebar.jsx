// frontend/src/components/layout/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useQuery } from '@tanstack/react-query';
import { FiHome, FiUsers, FiBriefcase, FiBookmark, FiSettings, FiLogOut } from 'react-icons/fi';
import { RiBuilding2Line, RiGroupLine } from 'react-icons/ri';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { BsGrid3X3Gap } from 'react-icons/bs';
import { AiOutlineMessage } from 'react-icons/ai';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user', user?._id],
    queryFn: () => userService.getUserById(user?._id),
    enabled: !!user?._id,
  });

  // Set active item based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveItem('home');
    else if (path.startsWith('/network')) setActiveItem('network');
    else if (path.startsWith('/jobs')) setActiveItem('jobs');
    else if (path.startsWith('/messaging')) setActiveItem('messaging');
    else if (path.startsWith('/notifications')) setActiveItem('notifications');
    else if (path.startsWith('/profile')) setActiveItem('profile');
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { id: 'home', icon: <FiHome className="w-5 h-5" />, label: 'Home', path: '/' },
    { id: 'network', icon: <FiUsers className="w-5 h-5" />, label: 'My Network', path: '/network' },
    { id: 'jobs', icon: <FiBriefcase className="w-5 h-5" />, label: 'Jobs', path: '/jobs' },
    { id: 'messaging', icon: <AiOutlineMessage className="w-5 h-5" />, label: 'Messaging', path: '/messaging' },
    { id: 'notifications', icon: <IoMdNotificationsOutline className="w-5 h-5" />, label: 'Notifications', path: '/notifications' },
  ];

  const discoverItems = [
    { id: 'groups', icon: <RiGroupLine className="w-5 h-5" />, label: 'Groups' },
    { id: 'marketplace', icon: <BsGrid3X3Gap className="w-5 h-5" />, label: 'Marketplace' },
    { id: 'companies', icon: <RiBuilding2Line className="w-5 h-5" />, label: 'Companies' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">LinkedIn</span>
            </Link>
          </div>

          {/* User profile */}
          <div className="p-4 border-b border-gray-200">
            <Link to={`/profile/${user?._id}`} className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src={userData?.avatar || '/default-avatar.png'}
                  alt={userData?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600">
                  {userData?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {userData?.headline || 'Update your profile'}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    activeItem === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <span
                    className={`mr-3 ${
                      activeItem === item.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Discover section */}
            <div className="mt-6 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Discover
              </h3>
              <div className="mt-2 space-y-1">
                {discoverItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved items */}
            <div className="mt-4 px-4">
              <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <span className="mr-3 text-gray-500">
                  <FiBookmark className="w-5 h-5" />
                </span>
                Saved Items
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              <FiLogOut className="w-5 h-5 mr-3 text-gray-500" />
              Sign Out
            </button>
            <div className="mt-4 text-xs text-gray-500">
              <p>LinkedIn Clone © {new Date().getFullYear()}</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}