import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  IconPlus, 
  IconTrash, 
  IconPencil, 
  IconAddressBook,
  IconPhone,
  IconUser
} from '@tabler/icons-react';
import { PhoneInput } from '../components/PhoneInput';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useContactList, useAddContact, useEditContact, useDeleteContact } from '../hooks/useContacts';
import type { ContactItem } from '../hooks/useContacts';

export const Contact: React.FC = () => {
  // ── Query hooks ──────────────────────────────────────────────────
  const { data: contacts = [], isLoading } = useContactList();
  const addContact = useAddContact();
  const editContact = useEditContact();
  const deleteContact = useDeleteContact();

  // ── UI state ─────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('ID');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Helper: Parse phone number into country calling code and local number part
  const parsePhoneNumber = (fullNumber: string) => {
    const digits = fullNumber.replace(/\D/g, '');
    const countries = getCountries().sort((a, b) => {
      const codeA = getCountryCallingCode(a);
      const codeB = getCountryCallingCode(b);
      return codeB.length - codeA.length;
    });

    for (const iso of countries) {
      const dialCode = getCountryCallingCode(iso);
      if (digits.startsWith(dialCode)) {
        const localNumber = digits.substring(dialCode.length);
        return { countryCode: iso, localNumber };
      }
    }
    return { countryCode: 'ID', localNumber: digits };
  };

  // Open Dialog for Add Contact
  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setCountryCode('ID');
    setValidationError(null);
    setDialogOpen(true);
  };

  // Open Dialog for Edit Contact
  const handleOpenEdit = (contact: ContactItem) => {
    setEditingContact(contact);
    setName(contact.name);
    const parsed = parsePhoneNumber(contact.whatsapp);
    setPhone(parsed.localNumber);
    setCountryCode(parsed.countryCode);
    setValidationError(null);
    setDialogOpen(true);
  };

  // Handle Delete Contact
  const handleDelete = (id: string) => {
    deleteContact.mutate(id);
  };

  // Submit form (Add or Edit)
  const handleSubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    // Validations
    if (!name.trim() || !phone.trim()) {
      setValidationError('Please fill in all fields.');
      return;
    }

    const isNumeric = /^\d+$/.test(phone.trim());
    if (!isNumeric) {
      setValidationError('WhatsApp number must contain digits only.');
      return;
    }

    if (phone.trim().length < 8 || phone.trim().length > 13) {
      setValidationError('WhatsApp number must be between 8 and 13 digits.');
      return;
    }

    const dialCode = getCountryCallingCode(countryCode as any);
    const fullWhatsapp = dialCode + phone.trim();

    if (editingContact) {
      editContact.mutate(
        { id: editingContact.id, name: name.trim(), whatsapp: fullWhatsapp },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      addContact.mutate(
        { name: name.trim(), whatsapp: fullWhatsapp },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        height: { xs: 'auto', md: 'calc(100vh - 200px)' },
        overflow: 'hidden'
      }}
    >
      {/* Header with Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Contacts Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage registered clients and targets for WhatsApp message distributions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconPlus size={18} />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 700, borderRadius: 2.5 }}
        >
          Add Contact
        </Button>
      </Box>

      {/* Main Card with Contact Table */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'rgba(225, 29, 72, 0.08)',
                color: 'primary.main',
              }}
            >
              <IconAddressBook size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Registered Contacts
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              flexGrow: 1,
              borderRadius: 1.5, 
              overflowY: 'auto', 
              border: '1px solid', 
              borderColor: 'divider',
              bgcolor: 'transparent',
              '&::-webkit-scrollbar': { width: 5 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2.5 }
            }}
          >
            <Table size="medium" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f4f4f4' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f4f4f4' }}>WhatsApp Number</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#f4f4f4', width: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No contacts registered. Click "Add Contact" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((row) => (
                    <TableRow 
                    key={row.id} 
                    // sx={{ '&:last-child td, &:last-child th': { border: 0} }}
                    >
                      {/* Name Column */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <IconUser size={18} style={{ opacity: 0.7 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Phone Column */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <IconPhone size={18} style={{ opacity: 0.7 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                            +{row.whatsapp}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEdit(row)}
                          >
                            <IconPencil size={18} />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDelete(row.id)}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Contact Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(16px)',
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: 400,
              width: '100%'
            }
          }
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                handleSubmit(e);
              }
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingContact ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body2" color="text.secondary">
              Configure contact details below. This contact will be available as recommendations in the messaging gateways.
            </Typography>

            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              placeholder="e.g. Jane Smith"
              required
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 2.5,
                }
              }}
            />

            <PhoneInput
              value={phone}
              onChange={setPhone}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained" 
              sx={{ fontWeight: 700 }}
              disabled={addContact.isPending || editContact.isPending}
            >
              {editingContact 
                ? (editContact.isPending ? 'Saving...' : 'Save Changes') 
                : (addContact.isPending ? 'Creating...' : 'Create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Contact;
