import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  Copy,
  Share,
  ExternalLink,
  Plus,
  Link,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const Telemedicine = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [generatedRoomId, setGeneratedRoomId] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);

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
  }, []);

  const generateRoomId = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `eldercare-${timestamp}-${randomString}`;
  };

  const createMeeting = () => {
    const roomId = roomName.trim() || generateRoomId();
    const jitsiLink = `https://meet.jit.si/${roomId}`;
    
    setGeneratedRoomId(roomId);
    setMeetingLink(jitsiLink);
    setShowMeetingInfo(true);
    
    toast.success('Meeting created successfully! 🎉');
  };

  const joinMeeting = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
      toast.info('Opening Jitsi Meet in new tab...');
    }
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied to clipboard! 📋');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareMeetingLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ElderCare Video Consultation',
          text: 'Join my video consultation',
          url: meetingLink,
        });
      } catch (err) {
        copyMeetingLink();
      }
    } else {
      copyMeetingLink();
    }
  };

  const resetMeeting = () => {
    setShowMeetingInfo(false);
    setMeetingLink('');
    setGeneratedRoomId('');
    setRoomName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container-padding py-8 space-y-8">
        <div className="card-gradient animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Telemedicine 🏥</h1>
              <p className="text-xl text-gray-600">Connect with your healthcare providers instantly</p>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="card-gradient border-l-4 border-red-500 animate-slide-up">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Notice</h3>
              <p className="text-red-700 mb-3">
                For medical emergencies, please call 112 immediately. This telemedicine service is for non-emergency consultations only.
              </p>
              <button 
                onClick={() => window.open('tel:112', '_self')}
                className="btn-danger flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Emergency Call (112)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Video Meeting Creation */}
        <div className="card-gradient animate-slide-up">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Video Meeting</h2>
                  <p className="text-xl text-gray-600">Generate a secure Jitsi Meet link for your consultation</p>
                </div>

                {!showMeetingInfo ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-3xl p-8 border border-blue-200">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Video className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">Start Your Consultation</h3>
                        <p className="text-blue-700">Create a meeting room and share the link with your doctor</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Meeting Room Name (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Dr-Smith-Consultation"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="input-primary text-lg"
                          />
                          <p className="text-sm text-gray-500 mt-2">Leave empty to generate a secure room name automatically</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <button 
                            onClick={createMeeting}
                            className="btn-primary flex-1 flex items-center justify-center space-x-3 text-lg py-4"
                          >
                            <Plus className="w-6 h-6" />
                            <span>Create Meeting</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-3xl p-8 border border-green-200">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">Meeting Created Successfully! 🎉</h3>
                        <p className="text-green-700">Your video consultation room is ready</p>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">Room ID:</h4>
                              <p className="text-blue-600 font-mono text-lg break-all">{generatedRoomId}</p>
                            </div>
                            <Link className="w-8 h-8 text-blue-600" />
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Meeting Link:</h4>
                            <div className="bg-gray-50 rounded-xl p-4 border">
                              <p className="text-blue-600 font-mono break-all">{meetingLink}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={joinMeeting}
                              className="btn-primary flex-1 flex items-center justify-center space-x-2"
                            >
                              <ExternalLink className="w-5 h-5" />
                              <span>Join Meeting</span>
                            </button>
                            <button 
                              onClick={copyMeetingLink}
                              className="btn-secondary flex items-center justify-center space-x-2"
                            >
                              <Copy className="w-5 h-5" />
                              <span>Copy Link</span>
                            </button>
                            <button 
                              onClick={shareMeetingLink}
                              className="btn-secondary flex items-center justify-center space-x-2"
                            >
                              <Share className="w-5 h-5" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={resetMeeting}
                          className="w-full btn-secondary"
                        >
                          Create New Meeting
                        </button>
                      </div>
                    </div>
                  </div>
                )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card-gradient animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
          
          <div className="space-y-4">
            {upcomingAppointments.map((appointment, index) => (
              <div key={appointment.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <User className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{appointment.doctor}</h3>
                      <p className="text-gray-600 text-lg">{appointment.specialty}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-5 h-5" />
                          <span className="font-medium">{appointment.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <button 
                      onClick={() => {
                        const roomId = `eldercare-${appointment.doctor.replace(/\s+/g, '-').toLowerCase()}-${appointment.id}`;
                        setRoomName(roomId);
                        createMeeting();
                      }}
                      className="btn-primary"
                    >
                      Create Meeting
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Telemedicine;
