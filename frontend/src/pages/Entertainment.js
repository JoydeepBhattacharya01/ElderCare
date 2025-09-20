import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Music, 
  Newspaper, 
  Gamepad2, 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  Heart,
  Share,
  Star,
  Clock,
  Trophy,
  Brain,
  Puzzle,
  Youtube,
  ExternalLink,
  Video,
  Tv,
  BookOpen
} from 'lucide-react';

const Entertainment = () => {
  const [activeTab, setActiveTab] = useState('music');
  const [musicStations, setMusicStations] = useState([]);
  const [news, setNews] = useState([]);
  const [games, setGames] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameScore, setGameScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetchEntertainmentData();
  }, []);

  const fetchEntertainmentData = async () => {
    try {
      const [musicRes, newsRes, gamesRes] = await Promise.all([
        axios.get('/api/entertainment/music'),
        axios.get('/api/entertainment/news'),
        axios.get('/api/entertainment/games')
      ]);

      setMusicStations(musicRes.data);
      setNews(newsRes.data.articles);
      setGames(gamesRes.data);
      
      // Mock video content with YouTube links
      setVideos([
        {
          id: 1,
          title: "Gentle Morning Yoga for Seniors",
          description: "Start your day with gentle stretching and breathing exercises",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          youtubeId: "dQw4w9WgXcQ",
          category: "Exercise",
          duration: "15 min",
          difficulty: "Easy"
        },
        {
          id: 2,
          title: "Meditation for Better Sleep",
          description: "Relaxing meditation to help you fall asleep peacefully",
          thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/maxresdefault.jpg",
          youtubeId: "ZToicYcHIOU",
          category: "Wellness",
          duration: "20 min",
          difficulty: "Easy"
        },
        {
          id: 3,
          title: "Chair Exercises for Seniors",
          description: "Safe and effective exercises you can do from your chair",
          thumbnail: "https://img.youtube.com/vi/qX9FSZJu448/maxresdefault.jpg",
          youtubeId: "qX9FSZJu448",
          category: "Exercise",
          duration: "12 min",
          difficulty: "Easy"
        },
        {
          id: 4,
          title: "Brain Training Games",
          description: "Fun mental exercises to keep your mind sharp",
          thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
          youtubeId: "kJQP7kiw5Fk",
          category: "Mental Health",
          duration: "25 min",
          difficulty: "Medium"
        },
        {
          id: 5,
          title: "Cooking Healthy Meals",
          description: "Simple and nutritious recipes for seniors",
          thumbnail: "https://img.youtube.com/vi/sTJ7AzBIJoI/maxresdefault.jpg",
          youtubeId: "sTJ7AzBIJoI",
          category: "Nutrition",
          duration: "18 min",
          difficulty: "Easy"
        },
        {
          id: 6,
          title: "Nature Sounds for Relaxation",
          description: "Peaceful nature sounds to help you relax and unwind",
          thumbnail: "https://img.youtube.com/vi/eKFTSSKCzWA/maxresdefault.jpg",
          youtubeId: "eKFTSSKCzWA",
          category: "Relaxation",
          duration: "60 min",
          difficulty: "Easy"
        }
      ]);

      // Mock activities
      setActivities([
        {
          id: 1,
          title: "Virtual Museum Tours",
          description: "Explore world-famous museums from your home",
          icon: "museum",
          link: "https://www.google.com/search?q=virtual+museum+tours",
          category: "Culture"
        },
        {
          id: 2,
          title: "Online Gardening Classes",
          description: "Learn gardening tips and techniques",
          icon: "flower",
          link: "https://www.youtube.com/results?search_query=gardening+for+seniors",
          category: "Hobbies"
        },
        {
          id: 3,
          title: "Virtual Travel Experiences",
          description: "Take virtual trips around the world",
          icon: "plane",
          link: "https://www.google.com/search?q=virtual+travel+experiences",
          category: "Travel"
        },
        {
          id: 4,
          title: "Online Book Clubs",
          description: "Join discussions about your favorite books",
          icon: "book",
          link: "https://www.goodreads.com/group",
          category: "Reading"
        },
        {
          id: 5,
          title: "Craft Tutorials",
          description: "Learn new crafts and DIY projects",
          icon: "scissors",
          link: "https://www.youtube.com/results?search_query=senior+crafts+tutorials",
          category: "Crafts"
        },
        {
          id: 6,
          title: "Cooking Shows",
          description: "Watch cooking shows and learn new recipes",
          icon: "chef",
          link: "https://www.youtube.com/results?search_query=cooking+shows+for+seniors",
          category: "Cooking"
        }
      ]);
    } catch (error) {
      toast.error('Failed to load entertainment content');
    }
  };

  const playStation = (station) => {
    setCurrentStation(station);
    setIsPlaying(true);
    toast.success(`Now playing: ${station.name}`);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const startGame = (game) => {
    setSelectedGame(game);
    setGameScore(0);
  };

  const endGame = () => {
    setSelectedGame(null);
    setGameScore(0);
  };

  // YouTube redirection functions
  const watchOnYouTube = (video) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
    window.open(youtubeUrl, '_blank');
    toast.success(`Opening "${video.title}" on YouTube`);
  };

  const openActivity = (activity) => {
    window.open(activity.link, '_blank');
    toast.success(`Opening "${activity.title}"`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Exercise': 'bg-green-100 text-green-800',
      'Wellness': 'bg-blue-100 text-blue-800',
      'Mental Health': 'bg-purple-100 text-purple-800',
      'Nutrition': 'bg-orange-100 text-orange-800',
      'Relaxation': 'bg-indigo-100 text-indigo-800',
      'Culture': 'bg-pink-100 text-pink-800',
      'Hobbies': 'bg-yellow-100 text-yellow-800',
      'Travel': 'bg-cyan-100 text-cyan-800',
      'Reading': 'bg-red-100 text-red-800',
      'Crafts': 'bg-teal-100 text-teal-800',
      'Cooking': 'bg-amber-100 text-amber-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderMusicTab = () => (
    <div className="space-y-6">
      {/* Now Playing */}
      {currentStation && (
        <div className="card bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentStation.name}</h3>
                <p className="opacity-90">{currentStation.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={togglePlayPause}
                className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Music Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musicStations.map((station) => (
          <div key={station.id} className="card hover:shadow-medium transition-shadow duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{station.name}</h3>
              <p className="text-gray-600 mb-4">{station.description}</p>
              <button
                onClick={() => playStation(station)}
                className="btn-primary w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((article, index) => (
          <div key={index} className="card hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-3">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {article.source.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGamesTab = () => (
    <div className="space-y-6">
      {!selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {game.type === 'memory' && <Brain className="w-8 h-8 text-purple-600" />}
                  {game.type === 'word' && <Puzzle className="w-8 h-8 text-purple-600" />}
                  {game.type === 'number' && <Gamepad2 className="w-8 h-8 text-purple-600" />}
                  {game.type === 'quiz' && <Trophy className="w-8 h-8 text-purple-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{game.name}</h3>
                <p className="text-gray-600 mb-3">{game.description}</p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    game.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
                <button
                  onClick={() => startGame(game)}
                  className="btn-primary w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Game
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedGame.name}</h2>
              <p className="text-gray-600">{selectedGame.description}</p>
            </div>
            <button
              onClick={endGame}
              className="btn-secondary"
            >
              Exit Game
            </button>
          </div>

          {/* Game Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
            <p className="text-blue-700">{selectedGame.instructions}</p>
          </div>

          {/* Game Area */}
          <div className="bg-gray-100 rounded-xl p-8 text-center min-h-64 flex items-center justify-center">
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Game in Progress</h3>
              <p className="text-gray-600 mb-4">
                This is a demo game interface. In a full implementation, you would see the actual game here.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{gameScore}</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">00:00</div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button className="btn-primary">
              <Play className="w-4 h-4 mr-2" />
              Start
            </button>
            <button className="btn-secondary">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </button>
            <button className="btn-secondary">
              <Trophy className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderVideosTab = () => (
    <div className="space-y-6">
      {/* Videos Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Youtube className="w-6 h-6 text-red-600 mr-2" />
          Health & Wellness Videos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="relative mb-4">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/320x180/f3f4f6/9ca3af?text=Video+Thumbnail';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => watchOnYouTube(video)}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors duration-200"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">{video.title}</h4>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(video.category)}`}>
                    {video.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    video.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    video.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {video.difficulty}
                  </span>
                  <button
                    onClick={() => watchOnYouTube(video)}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Watch</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activities Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Tv className="w-6 h-6 text-blue-600 mr-2" />
          Online Activities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="card hover:shadow-medium transition-shadow duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {activity.icon === 'museum' && <Star className="w-8 h-8 text-blue-600" />}
                  {activity.icon === 'flower' && <Heart className="w-8 h-8 text-blue-600" />}
                  {activity.icon === 'plane' && <Share className="w-8 h-8 text-blue-600" />}
                  {activity.icon === 'book' && <BookOpen className="w-8 h-8 text-blue-600" />}
                  {activity.icon === 'scissors' && <Puzzle className="w-8 h-8 text-blue-600" />}
                  {activity.icon === 'chef' && <Tv className="w-8 h-8 text-blue-600" />}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h4>
                <p className="text-gray-600 mb-3">{activity.description}</p>
                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium mb-4 ${getCategoryColor(activity.category)}`}>
                  {activity.category}
                </span>
                <button
                  onClick={() => openActivity(activity)}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Explore</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Music className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entertainment</h1>
          <p className="text-lg text-gray-600">Music, news, and brain games for your enjoyment</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card p-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'music'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Music className="w-5 h-5 inline mr-2" />
            Music & Radio
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'news'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Newspaper className="w-5 h-5 inline mr-2" />
            News & Updates
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'games'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Gamepad2 className="w-5 h-5 inline mr-2" />
            Brain Games
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 px-6 py-4 text-lg font-medium transition-colors duration-200 ${
              activeTab === 'videos'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Youtube className="w-5 h-5 inline mr-2" />
            Videos & Activities
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'music' && renderMusicTab()}
          {activeTab === 'news' && renderNewsTab()}
          {activeTab === 'games' && renderGamesTab()}
          {activeTab === 'videos' && renderVideosTab()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Music Therapy</h3>
          <p className="text-gray-600">
            Listening to music can reduce stress and improve mood
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brain Training</h3>
          <p className="text-gray-600">
            Keep your mind sharp with daily brain exercises
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Informed</h3>
          <p className="text-gray-600">
            Read the latest health and wellness news
          </p>
        </div>
      </div>
    </div>
  );
};

export default Entertainment;
