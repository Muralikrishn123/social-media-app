// frontend/src/pages/profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postService } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/index';
import { FiEdit, FiUserPlus, FiUsers, FiBriefcase, FiMapPin, FiMail, FiClock } from 'react-icons/fi';
import { userService } from '../../services/userService';

export default function Profile() {
  const { userId: urlUserId } = useParams();
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  // Determine which user's profile to show
  const targetUserId = urlUserId || (isAuthenticated ? currentUser?._id : null);

  // Redirect to login if no user ID is available
  useEffect(() => {
    if (!isAuthLoading && !targetUserId) {
      console.log('No user ID available, redirecting to login');
      navigate('/login');
    }
  }, [targetUserId, isAuthLoading, navigate]);

  // Debug logs
  console.log('Profile render:', { 
    urlUserId, 
    currentUserId: currentUser?._id, 
    isAuthenticated, 
    targetUserId 
  });

  // Fetch user profile
  const { 
    data: profileData, 
    isLoading: isLoadingProfile,
    error: profileError 
  } = useQuery({
    queryKey: ['user', targetUserId],
    queryFn: () => {
      if (!targetUserId) {
        console.error('No targetUserId available for profile fetch');
        return Promise.reject('No user ID provided');
      }
      return userService.getUserById(targetUserId);
    },
    enabled: !!targetUserId && !isAuthLoading,
  });

  // Fetch user's posts
  const { 
    data: postsData, 
    isLoading: isLoadingPosts,
    error: postsError 
  } = useQuery({
    queryKey: ['userPosts', targetUserId],
    queryFn: () => {
      if (!targetUserId) {
        console.error('No targetUserId available for posts fetch');
        return Promise.reject('No user ID provided');
      }
      return postService.getUserPosts(targetUserId);
    },
    enabled: !!targetUserId && !isAuthLoading,
  });

  // Fetch user's connections
  const { 
    data: connectionsData, 
    isLoading: isLoadingConnections,
    error: connectionsError 
  } = useQuery({
    queryKey: ['connections', targetUserId],
    queryFn: () => {
      if (!targetUserId) {
        console.error('No targetUserId available for connections fetch');
        return Promise.reject('No user ID provided');
      }
      return userService.getConnections(targetUserId);
    },
    enabled: !!targetUserId && !isAuthLoading,
  });

  const profile = profileData?.data;
  const posts = postsData?.data || [];
  const connections = connectionsData?.data || [];
  const isCurrentUser = currentUser?._id === targetUserId;

  // Loading state
  if (isAuthLoading || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Error loading profile</h2>
        <p className="text-gray-600 mt-2">
          {profileError.message || 'Failed to load user profile'}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="primary"
        >
          Retry
        </Button>
      </div>
    );
  }

  // No user found
  if (!profile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold">User not found</h2>
        <p className="text-gray-600 mt-2">The requested profile could not be found.</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      {/* Profile Header */}
      <div className="px-6 -mt-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex items-end space-x-6">
            <div className="relative">
              <img
                src={profile.avatar || '/default-avatar.png'}
                alt={profile.name}
                className="h-32 w-32 rounded-full border-4 border-white bg-white"
              />
              {isCurrentUser && (
                <button
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition"
                  title="Edit profile picture"
                >
                  <FiEdit size={16} />
                </button>
              )}
            </div>
            <div className="pb-4">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.headline || 'No headline provided'}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <FiMapPin className="mr-1" />
                <span>{profile.location || 'Location not specified'}</span>
                {profile.createdAt && (
                  <span className="flex items-center ml-4">
                    <FiClock className="mr-1" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            {isCurrentUser ? (
              <Link
                to="/profile/edit"
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FiEdit className="mr-2" />
                Edit Profile
              </Link>
            ) : (
              <Button variant="primary" className="flex items-center">
                <FiUserPlus className="mr-2" />
                {connections.some(conn => conn._id === currentUser?._id) ? 'Connected' : 'Connect'}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Posts {posts.length > 0 && `(${posts.length})`}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`${
                activeTab === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
            >
              <FiUsers className="mr-1" />
              <span>Connections</span>
              {connections.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {connections.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-4">
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : postsError ? (
              <div className="text-center py-8 text-red-500">
                Failed to load posts. {postsError.message}
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div 
                  key={post._id} 
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={profile.avatar || '/default-avatar.png'}
                      alt={profile.name}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{profile.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="mt-3 rounded-lg w-full max-h-96 object-cover"
                    />
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-gray-500 text-sm">
                    <button className="flex items-center mr-6 hover:text-blue-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes?.length || 0}
                    </button>
                    <button className="flex items-center hover:text-blue-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments?.length || 0} comments
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                <p className="mt-1 text-gray-500">
                  {isCurrentUser ? 'Share your first post!' : `${profile.name.split(' ')[0]} hasn't posted anything yet.`}
                </p>
                {isCurrentUser && (
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Create post
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {/* Bio Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {profile.bio || 'No bio provided.'}
              </p>
            </div>

            {/* Experience Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Experience</h3>
                {isCurrentUser && (
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    + Add Experience
                  </button>
                )}
              </div>
              
              {profile.experience?.length > 0 ? (
                <div className="space-y-6">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                          <FiBriefcase className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short' 
                          })} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-gray-600 text-sm">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No experience added</p>
                  {isCurrentUser && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Add your work experience
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Education Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Education</h3>
                {isCurrentUser && (
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    + Add Education
                  </button>
                )}
              </div>
              
              {profile.education?.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{edu.school}</h4>
                        <p className="text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(edu.startDate).getFullYear()} -{' '}
                          {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                        </p>
                        {edu.description && (
                          <p className="mt-2 text-gray-600 text-sm">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No education added</p>
                  {isCurrentUser && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Add your education
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                {isCurrentUser && (
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    + Add Skills
                  </button>
                )}
              </div>
              
              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No skills added</p>
                  {isCurrentUser && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Add your skills
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            {isLoadingConnections ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : connectionsError ? (
              <div className="text-center py-8 text-red-500">
                Failed to load connections. {connectionsError.message}
              </div>
            ) : connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <div
                    key={connection._id}
                    className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <Link 
                      to={`/profile/${connection._id}`}
                      className="flex items-center w-full"
                    >
                      <img
                        src={connection.avatar || '/default-avatar.png'}
                        alt={connection.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {connection.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {connection.headline || 'No headline'}
                        </p>
                      </div>
                    </Link>
                    {isCurrentUser && (
                      <button className="ml-2 text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiUsers className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isCurrentUser ? 'No connections yet' : 'No connections to show'}
                </h3>
                <p className="mt-1 text-gray-500">
                  {isCurrentUser 
                    ? 'Connect with others to see their profiles here.' 
                    : `${profile.name.split(' ')[0]} hasn't added any connections yet.`}
                </p>
                {isCurrentUser && (
                  <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Find connections
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}