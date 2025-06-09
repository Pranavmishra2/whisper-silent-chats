
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, UserPlus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_user_id: string | null;
  has_app: boolean;
  is_blocked: boolean;
}

interface ContactsListProps {
  onSelectContact: (contact: Contact) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_blocked', false)
        .order('contact_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    try {
      // Check if the phone number belongs to an existing user
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', newContactPhone)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user?.id,
          contact_name: newContactName,
          contact_phone: newContactPhone,
          contact_user_id: profiles?.id || null,
          has_app: !!profiles?.id,
        });

      if (error) throw error;

      toast({
        title: "Contact added",
        description: profiles?.id 
          ? "Contact has SilentVoice app - ready to whisper!"
          : "Contact added. They'll need to install SilentVoice to receive whisper messages.",
      });

      setNewContactName('');
      setNewContactPhone('');
      setShowAddForm(false);
      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const inviteContact = (contact: Contact) => {
    const message = `Hey! I'm using SilentVoice to send whisper messages. Install it from the app store to receive my quiet voice messages: https://silentvoice.app`;
    const whatsappUrl = `https://wa.me/${contact.contact_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contact_phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contacts</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {showAddForm && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
          <Input
            placeholder="Contact name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
          />
          <Input
            placeholder="Phone number (+1234567890)"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button onClick={addContact} size="sm">
              Add
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
            onClick={() => contact.has_app && onSelectContact(contact)}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{contact.contact_name}</h4>
                {contact.has_app ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Available to Whisper
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    No App
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {contact.contact_phone}
              </p>
            </div>

            <div className="flex space-x-2">
              {contact.has_app ? (
                <Button size="sm" onClick={() => onSelectContact(contact)}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    inviteContact(contact);
                  }}
                >
                  Invite
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No contacts found</p>
            <p className="text-sm">Add contacts to start whispering!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContactsList;
