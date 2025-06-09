
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Users, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VoiceControls from '@/components/VoiceControls';
import MessageBubble from '@/components/MessageBubble';
import SettingsPanel from '@/components/SettingsPanel';
import ContactsList from '@/components/ContactsList';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  type: 'text' | 'whisper' | 'voice';
  sender: 'user' | 'other';
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
  volume?: number;
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
  const [showContacts, setShowContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    speed: 0.7,
    pitch: 0.8,
    volume: 0.4,
    autoPlay: false,
    notifications: true
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setShowContacts(true);
      } else {
        setShowContacts(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async (asWhisper: boolean = false) => {
    if (!inputText.trim()) return;

    if (!selectedContact) {
      toast({
        title: "No contact selected",
        description: "Please select a contact to send messages",
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

  const handleSendVoiceMessage = async (audioBlob: Blob, volume: number) => {
    if (!selectedContact) {
      toast({
        title: "No contact selected",
        description: "Please select a contact to send voice messages",
        variant: "destructive",
      });
      return;
    }

    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: "Voice message",
        type: 'voice',
        sender: 'user',
        timestamp: new Date(),
        audioUrl,
        volume
      };

      setMessages(prev => [...prev, newMessage]);

      toast({
        title: "Voice message sent",
        description: `Voice message sent to ${selectedContact.contact_name}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
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
    setIsMobileMenuOpen(false);
    setMessages([]);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">SilentVoice</h1>
            {selectedContact ? (
              <div className="text-sm text-muted-foreground hidden sm:block">
                Chat with {selectedContact.contact_name}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user.user_metadata?.full_name || user.email}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowContacts(!showContacts);
                setIsMobileMenuOpen(false);
              }}
              className="hidden md:flex"
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
        
        {/* Mobile selected contact info */}
        {selectedContact && (
          <div className="text-sm text-muted-foreground mt-2 sm:hidden">
            Chat with {selectedContact.contact_name}
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden">
            <div className="w-80 h-full border-r border-border bg-card/90 backdrop-blur-sm p-4 overflow-y-auto">
              <ContactsList onSelectContact={handleSelectContact} />
            </div>
          </div>
        )}

        {/* Desktop Contacts Sidebar */}
        {showContacts && (
          <div className="hidden md:block w-80 border-r border-border bg-card/50 backdrop-blur-sm p-4 overflow-y-auto">
            <ContactsList onSelectContact={handleSelectContact} />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
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
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-lg font-medium mb-2">
                      Start a conversation with {selectedContact.contact_name}
                    </div>
                    <p className="text-sm">
                      {selectedContact.has_app 
                        ? "Send whisper messages, voice recordings, or regular text"
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
                onSendVoiceMessage={handleSendVoiceMessage}
                isConverting={isConverting}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center p-4">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Select a contact</h3>
                <p className="mb-4">Choose a contact from the list to start whispering</p>
                <Button
                  onClick={() => {
                    setShowContacts(true);
                    setIsMobileMenuOpen(true);
                  }}
                  className="md:hidden"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Contacts
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
