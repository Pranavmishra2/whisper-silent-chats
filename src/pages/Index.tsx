
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VoiceControls from '@/components/VoiceControls';
import MessageBubble from '@/components/MessageBubble';
import SettingsPanel from '@/components/SettingsPanel';
import ContactsList from '@/components/ContactsList';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  type: 'text' | 'whisper';
  sender: 'user' | 'other';
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

interface Contact {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_user_id: string | null;
  has_app: boolean;
  is_blocked: boolean;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [settings, setSettings] = useState({
    speed: 0.7,
    pitch: 0.8,
    volume: 0.4
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSendMessage = async (asWhisper: boolean = false) => {
    if (!inputText.trim()) return;

    if (!selectedContact) {
      toast({
        title: "No contact selected",
        description: "Please select a contact to send whisper messages",
        variant: "destructive",
      });
      return;
    }

    if (asWhisper && !selectedContact.has_app) {
      toast({
        title: "Receiver doesn't have SilentVoice app",
        description: "Please invite them to install the app first",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(asWhisper);

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        type: asWhisper ? 'whisper' : 'text',
        sender: 'user',
        timestamp: new Date(),
      };

      if (asWhisper) {
        // Simulate TTS conversion delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        newMessage.audioUrl = 'simulated-audio-url';
      }

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      toast({
        title: asWhisper ? "Whisper message sent" : "Text message sent",
        description: `Message sent to ${selectedContact.contact_name}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handlePlayWhisper = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isPlaying: !msg.isPlaying }
          : { ...msg, isPlaying: false }
      )
    );

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => ({ ...msg, isPlaying: false }))
      );
    }, 3000);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContacts(false);
    setMessages([]); // Clear messages when switching contacts
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-800">SilentVoice</h1>
            {selectedContact ? (
              <div className="text-sm text-slate-600">
                Chat with {selectedContact.contact_name}
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                Welcome, {user.user_metadata?.full_name || user.email}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContacts(!showContacts)}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Contacts Sidebar */}
        {showContacts && (
          <div className="w-80 border-r border-slate-200 bg-white/50 backdrop-blur-sm p-4 overflow-y-auto">
            <ContactsList onSelectContact={handleSelectContact} />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onPlayWhisper={handlePlayWhisper}
                  />
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-lg font-medium mb-2">
                      Start a conversation with {selectedContact.contact_name}
                    </div>
                    <p className="text-sm">
                      {selectedContact.has_app 
                        ? "Send whisper messages or regular text"
                        : "This contact needs to install SilentVoice to receive whisper messages"}
                    </p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <VoiceControls
                settings={settings}
                inputText={inputText}
                onInputChange={setInputText}
                onSendMessage={handleSendMessage}
                isConverting={isConverting}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Select a contact</h3>
                <p>Choose a contact from the list to start whispering</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
