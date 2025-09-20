import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Copy,
  Share
} from 'lucide-react';
import { toast } from 'react-toastify';

const Telemedicine = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [isJitsiActive, setIsJitsiActive] = useState(false);
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    setUpcomingAppointments([
      {
        id: 1,
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        date: '2024-01-15',
        time: '10:00 AM',
        type: 'Follow-up',
        status: 'confirmed'
      },
      {
        id: 2,
        doctor: 'Dr. Michael Chen',
        specialty: 'General Medicine',
        date: '2024-01-20',
        time: '2:30 PM',
        type: 'Consultation',
        status: 'pending'
      }
    ]);

    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isCallActive]);

  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const generateRoomId = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `eldercare-${timestamp}-${randomStr}`;
  };

  const startJitsiCall = (roomId = null) => {
    const finalRoomId = roomId || roomName || generateRoomId();
    
    if (!finalRoomId) {
      toast.error('Please enter a room name or generate one');
      return;
    }

    if (!window.JitsiMeetExternalAPI) {
      toast.info('Loading video call interface...');
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => {
        console.log('Jitsi API loaded successfully');
        initializeJitsi(finalRoomId);
      };
      script.onerror = () => {
        toast.error('Failed to load video call interface. Please check your internet connection.');
      };
      document.head.appendChild(script);
    } else {
      initializeJitsi(finalRoomId);
    }
  };

  const initializeJitsi = (roomId) => {
    try {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }

      setTimeout(() => {
        if (!jitsiContainerRef.current) {
          toast.error('Video container not ready. Please try again.');
          return;
        }
        
        createJitsiInstance(roomId);
      }, 100);
    } catch (error) {
      console.error('Jitsi initialization error:', error);
      toast.error('Failed to start video call. Please try again.');
      endJitsiCall();
    }
  };

  const createJitsiInstance = (roomId) => {
    try {

      const domain = 'meet.jit.si';
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
          disableDeepLinking: true,
          enableClosePage: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'tileview', 'help'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          DEFAULT_BACKGROUND: '#474747',
          DISABLE_VIDEO_BACKGROUND: false,
          INITIAL_TOOLBAR_TIMEOUT: 20000,
          TOOLBAR_TIMEOUT: 4000,
        },
        userInfo: {
          displayName: 'ElderCare Patient',
          email: 'patient@eldercare.com'
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      jitsiApiRef.current.addEventListener('readyToClose', () => {
        endJitsiCall();
      });

      jitsiApiRef.current.addEventListener('participantJoined', (participant) => {
        toast.success(`${participant.displayName || 'Someone'} joined the call`);
      });

      jitsiApiRef.current.addEventListener('participantLeft', (participant) => {
        toast.info(`${participant.displayName || 'Someone'} left the call`);
      });

      jitsiApiRef.current.addEventListener('videoConferenceJoined', () => {
        toast.success('Successfully joined the video call!');
      });

      jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
        endJitsiCall();
      });

      jitsiApiRef.current.addEventListener('connectionFailed', () => {
        toast.error('Connection failed. Please check your internet and try again.');
        endJitsiCall();
      });

      setIsJitsiActive(true);
      setGeneratedRoomId(roomId);
      toast.success('Video call is starting...');
      
    } catch (error) {
      console.error('Jitsi creation error:', error);
      toast.error('Failed to create video call. Please try again.');
      endJitsiCall();
    }
  };

  const endJitsiCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setIsJitsiActive(false);
    setGeneratedRoomId('');
  };

  const copyRoomLink = () => {
    const roomLink = `https://meet.jit.si/${generatedRoomId}`;
    navigator.clipboard.writeText(roomLink).then(() => {
      toast.success('Room link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const shareRoomLink = () => {
    const roomLink = `https://meet.jit.si/${generatedRoomId}`;
    if (navigator.share) {
      navigator.share({
        title: 'ElderCare Video Consultation',
        text: 'Join my video consultation',
        url: roomLink,
      });
    } else {
      copyRoomLink();
    }
  };

  const joinAppointmentCall = (appointment) => {
    const roomId = `eldercare-appointment-${appointment.id}-${appointment.doctor.replace(/\s+/g, '-').toLowerCase()}`;
    startJitsiCall(roomId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Video className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Telemedicine</h1>
          <p className="text-lg text-gray-600">Connect with your healthcare providers</p>
        </div>
      </div>

      <div className="card border-l-4 border-danger-500 bg-danger-50">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-danger-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-danger-800 mb-2">Emergency Notice</h3>
            <p className="text-danger-700 mb-3">
              For medical emergencies, please call 911 immediately. This telemedicine service is for non-emergency consultations only.
            </p>
            <button className="bg-danger-600 hover:bg-danger-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Emergency Call (911)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Video Consultation</h2>
          
          {!isCallActive ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Video Call</h3>
              <p className="text-gray-600 mb-6">
                Connect with your doctor for a virtual consultation
              </p>
              <button
                onClick={startCall}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Phone className="w-5 h-5" />
                <span>Start Call</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-300">Cardiologist</p>
                  </div>
                </div>
                
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatDuration(callDuration)}
                </div>
                
                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isMuted ? 'bg-danger-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isVideoOff ? 'bg-danger-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="w-12 h-12 bg-danger-600 hover:bg-danger-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jitsi Meet Integration</h2>
          
          <div className="space-y-4">
            {!isJitsiActive ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Start Video Consultation</h3>
                  <p className="text-blue-700 mb-4">
                    Enter a room name or generate a secure meeting room for your consultation.
                  </p>
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Enter meeting room name (optional)"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button 
                        onClick={() => startJitsiCall()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Start Call</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        const newRoomId = generateRoomId();
                        setRoomName(newRoomId);
                        startJitsiCall(newRoomId);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Generate & Start Secure Room</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Ready for Video Call</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Click "Start Call" to begin your consultation
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Video Call Active</h3>
                      <p className="text-sm text-green-700">Room: {generatedRoomId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={copyRoomLink}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200"
                        title="Copy room link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={shareRoomLink}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
                        title="Share room link"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                      <button
                        onClick={endJitsiCall}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        End Call
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    Share the room link with your doctor to join the consultation.
                  </p>
                </div>

                <div 
                  ref={jitsiContainerRef}
                  className="bg-gray-900 rounded-xl overflow-hidden"
                  style={{ height: '400px', minHeight: '400px' }}
                  id="jitsi-container"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
        
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.doctor}
                      </h3>
                      <p className="text-gray-600">{appointment.specialty}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                        <span className="text-sm text-gray-600">{appointment.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <button 
                      onClick={() => joinAppointmentCall(appointment)}
                      className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Call</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Appointment</h3>
          <p className="text-gray-600 mb-4">
            Book a consultation with your healthcare provider
          </p>
          <button className="btn-primary">
            Schedule Now
          </button>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prescription Refill</h3>
          <p className="text-gray-600 mb-4">
            Request a refill for your current medications
          </p>
          <button className="btn-primary">
            Request Refill
          </button>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Nearby Clinics</h3>
          <p className="text-gray-600 mb-4">
            Locate healthcare facilities in your area
          </p>
          <button className="btn-primary">
            Find Clinics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Telemedicine;
