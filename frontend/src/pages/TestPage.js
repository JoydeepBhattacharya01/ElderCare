import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Send, Video, MessageCircle } from 'lucide-react';

const TestPage = () => {
  const [message, setMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const testChat = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/chat/demo', {
        message: message
      });
      setChatResponse(response.data.message);
      toast.success('Chat is working!');
    } catch (error) {
      toast.error('Chat failed: ' + error.message);
      setChatResponse('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = () => {
    const finalRoomName = roomName || `test-room-${Date.now()}`;
    
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => initializeJitsi(finalRoomName);
      script.onerror = () => toast.error('Failed to load Jitsi API');
      document.head.appendChild(script);
    } else {
      initializeJitsi(finalRoomName);
    }
  };

  const initializeJitsi = (roomId) => {
    try {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }

      const options = {
        roomName: roomId,
        width: '100%',
        height: 400,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        userInfo: {
          displayName: 'Test User'
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);
      
      jitsiApiRef.current.addEventListener('videoConferenceJoined', () => {
        toast.success('Video call started successfully!');
        setIsVideoActive(true);
      });

      jitsiApiRef.current.addEventListener('readyToClose', () => {
        endVideoCall();
      });

    } catch (error) {
      toast.error('Video call failed: ' + error.message);
    }
  };

  const endVideoCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setIsVideoActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ElderCare Test Page</h1>
          <p className="text-gray-600">Test chat and video calling functionality</p>
        </div>

        {/* Chat Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat Test
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message to test the chatbot..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && testChat()}
              />
              <button
                onClick={testChat}
                disabled={loading || !message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
            
            {chatResponse && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">AI Response:</h3>
                <p className="text-gray-700">{chatResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Call Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Video className="w-5 h-5 mr-2" />
            Video Call Test
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name (optional)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={startVideoCall}
                disabled={isVideoActive}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>{isVideoActive ? 'Call Active' : 'Start Call'}</span>
              </button>
              {isVideoActive && (
                <button
                  onClick={endVideoCall}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <span>End Call</span>
                </button>
              )}
            </div>
            
            <div 
              ref={jitsiContainerRef}
              className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
            >
              {!isVideoActive && (
                <p className="text-gray-500">Video call will appear here</p>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Chat Status</h3>
              <p className="text-blue-700">
                {chatResponse ? '✅ Working' : '⏳ Not tested yet'}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Video Status</h3>
              <p className="text-green-700">
                {isVideoActive ? '✅ Active' : '⏳ Not started'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
