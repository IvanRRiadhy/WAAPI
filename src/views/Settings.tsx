import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  IconButton, 
  Alert, 
  Chip,
  InputAdornment
} from '@mui/material';
import { 
  IconUser, 
  IconBuilding, 
  IconPhone, 
  IconMail, 
  IconKey, 
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconUpload
} from '@tabler/icons-react';
import { PhoneInput } from '../components/PhoneInput';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useLicenseInfo, useActivateLicense } from '../hooks/useLicense';

interface UserProfile {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  password?: string;
}

export const Settings: React.FC = () => {
  // Account details states
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Account editing field states
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState(''); // local number part
  const [editCountryCode, setEditCountryCode] = useState('ID'); // country ISO

  // Password verification modal for updating account data
  const [verifyPasswordOpen, setVerifyPasswordOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  // Change password dialog states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState<1 | 2>(1);
  const [changePasswordEmail, setChangePasswordEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Success / Error alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  // License upload file name state
  const [licenseFileName, setLicenseFileName] = useState<string | null>(null);

  // License hook queries & mutations
  const { data: licenseInfo, isFetching: isFetchingLicenseInfo, refetch: refetchLicenseInfo } = useLicenseInfo();
  const activateLicenseMutation = useActivateLicense();

  // Helper: Mask email (only show first 3 letters and after that put just 5 '*' with the '@something.com' after it)
  const maskEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const atIndex = emailStr.indexOf('@');
    const localPart = emailStr.substring(0, atIndex);
    const domainPart = emailStr.substring(atIndex);
    const prefix = localPart.substring(0, 3);
    return `${prefix}*****${domainPart}`;
  };

  // Helper: Parse phone number into country calling code and local part
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

  // Load profile from localStorage on mount
  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        const email = currentUser.email || '';
        
        const storedUsersStr = localStorage.getItem('registeredUsers');
        let foundUser: UserProfile | undefined;
        
        if (storedUsersStr) {
          const users = JSON.parse(storedUsersStr);
          if (Array.isArray(users)) {
            foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          }
        }
        
        if (foundUser) {
          setUser(foundUser);
        } else if (email.toLowerCase() === 'admin@waagent.com') {
          // Default admin profile details
          setUser({
            name: currentUser.name || 'Admin Developer',
            company: 'WA Agent Dev Corp',
            whatsapp: '6281234567890',
            email: 'admin@waagent.com',
            password: 'admin123'
          });
        } else {
          // Safe fallback
          setUser({
            name: currentUser.name || 'User Profile',
            company: 'WA Agent Organization',
            whatsapp: '6281234567890',
            email: email,
            password: 'password123'
          });
        }
      } catch (err) {
        console.error('Error loading active user details', err);
      }
    }
  }, []);

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditCompany(user.company);
    setEditEmail(user.email);
    
    const parsed = parsePhoneNumber(user.whatsapp);
    setEditWhatsapp(parsed.localNumber);
    setEditCountryCode(parsed.countryCode);
    
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSaveClick = () => {
    setError(null);
    
    // Field Validations
    if (!editName.trim() || !editCompany.trim() || !editEmail.trim() || !editWhatsapp.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const isNumeric = /^\d+$/.test(editWhatsapp.trim());
    if (!isNumeric) {
      setError('WhatsApp Number must contain digits only.');
      return;
    }
    
    if (editWhatsapp.trim().length < 8 || editWhatsapp.trim().length > 13) {
      setError('WhatsApp Number must be between 8 and 13 digits.');
      return;
    }

    // Check duplicate email
    const storedUsersStr = localStorage.getItem('registeredUsers');
    if (storedUsersStr && user) {
      try {
        const users = JSON.parse(storedUsersStr);
        if (Array.isArray(users)) {
          const conflict = users.some(
            u => u.email.toLowerCase() === editEmail.trim().toLowerCase() && 
                 u.email.toLowerCase() !== user.email.toLowerCase()
          );
          if (conflict) {
            setError('This email address is already registered to another account.');
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Validation passes, trigger password verification
    setVerifyPassword('');
    setShowVerifyPassword(false);
    setVerifyPasswordOpen(true);
  };

  const handleConfirmVerifyPassword = () => {
    if (!user) return;
    
    if (verifyPassword !== user.password) {
      setError('Incorrect password. Verification failed.');
      setVerifyPasswordOpen(false);
      return;
    }

    const dialCode = getCountryCallingCode(editCountryCode as any);
    const fullWhatsapp = dialCode + editWhatsapp.trim();
    
    const updatedUser: UserProfile = {
      name: editName.trim(),
      company: editCompany.trim(),
      whatsapp: fullWhatsapp,
      email: editEmail.trim().toLowerCase(),
      password: user.password
    };

    // Update in localStorage 'registeredUsers'
    const storedUsersStr = localStorage.getItem('registeredUsers');
    let users: any[] = [];
    if (storedUsersStr) {
      try {
        users = JSON.parse(storedUsersStr);
        if (!Array.isArray(users)) users = [];
      } catch (e) {
        users = [];
      }
    }

    const oldEmail = user.email.toLowerCase();
    const index = users.findIndex(u => u.email.toLowerCase() === oldEmail);
    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // Update in localStorage 'currentUser'
    localStorage.setItem('currentUser', JSON.stringify({
      name: updatedUser.name,
      email: updatedUser.email
    }));

    // Update component states
    setUser(updatedUser);
    setIsEditing(false);
    setVerifyPasswordOpen(false);
    setSuccess('Account data updated successfully!');
    
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Change Password Dialog logic
  const handleOpenChangePassword = () => {
    setChangePasswordEmail('');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setChangePasswordStep(1);
    setChangePasswordError(null);
    setChangePasswordOpen(true);
  };

  const handleVerifyChangePasswordEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);

    if (!user) return;

    if (changePasswordEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setChangePasswordError('The email entered does not match the account email.');
      return;
    }

    // Proceed to Step 2
    setChangePasswordStep(2);
  };

  const handleConfirmChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);

    if (!user) return;

    if (oldPassword !== user.password) {
      setChangePasswordError('Incorrect old password.');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('New passwords do not match.');
      return;
    }

    const updatedUser = { ...user, password: newPassword };

    // Save update in registeredUsers
    const storedUsersStr = localStorage.getItem('registeredUsers');
    let users: any[] = [];
    if (storedUsersStr) {
      try {
        users = JSON.parse(storedUsersStr);
        if (!Array.isArray(users)) users = [];
      } catch (e) {
        users = [];
      }
    }

    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    setUser(updatedUser);
    setChangePasswordOpen(false);
    setSuccess('Password updated successfully!');
    
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // License reload logic
  const handleReloadLicense = () => {
    refetchLicenseInfo();
  };

  // License upload logic
  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('New license uploaded:', file.name);
      setLicenseFileName(file.name);
      activateLicenseMutation.mutate({ file }, {
        onSuccess: () => {
          setSuccess(`License successfully updated with "${file.name}"`);
          setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || err?.message || 'Failed to update license.');
          setTimeout(() => setError(null), 3000);
        }
      });
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">Loading settings profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Settings & Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your personal account credentials and review your messaging plan license.
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ borderRadius: 2.5 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ borderRadius: 2.5 }}>{error}</Alert>}

      {/* Account Settings Card */}
      <Card>
        <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <IconUser size={20} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Account Settings
            </Typography>
          </Box>

          {!isEditing ? (
            // Read-Only Profile View
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <IconUser size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        NAME
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <IconBuilding size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        COMPANY
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.company}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <IconPhone size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        NUMBER
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        +{user.whatsapp}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <IconMail size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                        EMAIL ADDRESS
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {maskEmail(user.email)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleStartEdit}
                  sx={{ fontWeight: 700 }}
                >
                  Change Account Data
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleOpenChangePassword}
                  sx={{ fontWeight: 700 }}
                >
                  Change Password
                </Button>
              </Box>
            </Box>
          ) : (
            // Edit Profile Form
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <PhoneInput
                    value={editWhatsapp}
                    onChange={setEditWhatsapp}
                    countryCode={editCountryCode}
                    onCountryCodeChange={setEditCountryCode}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  {/* Keep wrapper spacing alignment match */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', ml: 0.25 }}>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      variant="outlined"
                      size="small"
                      placeholder="example@waagent.com"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: 44,
                          borderRadius: 2.5,
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveClick}
                  sx={{ fontWeight: 700 }}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleCancelEdit}
                  sx={{ fontWeight: 700 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* License Information Card */}
      <Card>
        <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  bgcolor: 'rgba(234, 88, 12, 0.08)',
                  color: 'secondary.main',
                }}
              >
                <IconKey size={20} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                License Information
              </Typography>
            </Box>

            <Button 
              variant="outlined" 
              color="primary"
              size="small"
              startIcon={<IconRefresh size={16} />}
              onClick={handleReloadLicense}
              disabled={isFetchingLicenseInfo}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              {isFetchingLicenseInfo ? 'Reloading...' : 'Reload License'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                  DAILY QUOTA
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {licenseInfo ? `${licenseInfo.dailyQuota.toLocaleString()} Messages` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Refreshes daily at 00:00 UTC
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                  MONTHLY QUOTA
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {licenseInfo ? `${licenseInfo.monthlyQuota.toLocaleString()} Messages` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Refreshes monthly
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                  LICENSE LIMITS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {licenseInfo ? `Max ${licenseInfo.maxAgents} Agents` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {licenseInfo ? `Max ${licenseInfo.maxUsers} Users` : 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'row', height: '100%', boxSizing: 'border-box' }}>
                <Grid size={{ xs: 12, sm: 9, md: 9 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                  LICENSE STATUS
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 0.5 }}>
                  <Chip 
                    label={licenseInfo ? "ACTIVE" : "INACTIVE"} 
                    color={licenseInfo ? "success" : "error"} 
                    size="small" 
                    sx={{ fontWeight: 800, fontSize: '0.7rem' }} 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {licenseInfo ? `Expires ${new Date(licenseInfo.expiredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'N/A'}
                </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                {licenseFileName && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5, fontWeight: 600, fontSize: '0.725rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    File: {licenseFileName}
                  </Typography>
                )}
                <Button
                  component="label"
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<IconUpload size={14} />}
                  disabled={activateLicenseMutation.isPending}
                  sx={{ mt: 1.5, fontSize: '0.725rem', py: 0.5, borderRadius: 2, width: '100%', textTransform: 'none', fontWeight: 700 }}
                >
                  {activateLicenseMutation.isPending ? 'Uploading...' : 'Upload License'}
                  <input
                    type="file"
                    hidden
                    onChange={handleLicenseUpload}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = '';
                    }}
                  />
                </Button>
                </Grid>


              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Verification Password Modal */}
      <Dialog 
        open={verifyPasswordOpen} 
        onClose={() => setVerifyPasswordOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Confirm Identity
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Please input your account password to verify and commit updates to your account settings.
          </Typography>
          <TextField
            fullWidth
            label="Password"
            type={showVerifyPassword ? 'text' : 'password'}
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowVerifyPassword(!showVerifyPassword)} edge="end" size="small">
                      {showVerifyPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setVerifyPasswordOpen(false)} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmVerifyPassword} color="primary" variant="contained" disabled={!verifyPassword} sx={{ fontWeight: 700 }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Change Password
        </DialogTitle>
        
        {changePasswordStep === 1 ? (
          // Step 1: Input Email Address
          <Box component="form" onSubmit={handleVerifyChangePasswordEmail}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                To security verify your request, please enter the registered email address of this account first.
              </Typography>

              {changePasswordError && <Alert severity="error" sx={{ borderRadius: 2 }}>{changePasswordError}</Alert>}

              <TextField
                fullWidth
                label="Registered Email"
                type="email"
                value={changePasswordEmail}
                onChange={(e) => setChangePasswordEmail(e.target.value)}
                size="small"
                required
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setChangePasswordOpen(false)} color="secondary" variant="outlined" sx={{ fontWeight: 700 }}>
                Cancel
              </Button>
              <Button type="submit" color="primary" variant="contained" disabled={!changePasswordEmail} sx={{ fontWeight: 700 }}>
                Submit
              </Button>
            </DialogActions>
          </Box>
        ) : (
          // Step 2: Old Password + New Password
          <Box component="form" onSubmit={handleConfirmChangePassword}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email verified. Please fill in credentials to change your account password.
              </Typography>

              {changePasswordError && <Alert severity="error" sx={{ borderRadius: 2 }}>{changePasswordError}</Alert>}

              <TextField
                fullWidth
                label="Old Password"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                size="small"
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end" size="small">
                          {showOldPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="small"
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" size="small">
                          {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />

              <TextField
                fullWidth
                label="Verify New Password"
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                size="small"
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end" size="small">
                          {showConfirmNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => {
                  setChangePasswordStep(1);
                  setChangePasswordError(null);
                }} 
                color="secondary" 
                variant="outlined" 
                sx={{ fontWeight: 700 }}
              >
                Back
              </Button>
              <Button type="submit" color="primary" variant="contained" disabled={!oldPassword || !newPassword || !confirmNewPassword} sx={{ fontWeight: 700 }}>
                Update Password
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default Settings;
