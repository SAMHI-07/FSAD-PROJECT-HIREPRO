import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { categories } from '../data';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchProfessionals,
  createProfessional,
  updateProfessional,
  deleteProfessional,
} from '../lib/api';

const emptyUserForm = {
  id: null,
  fullName: '',
  email: '',
  password: '',
  role: 'client',
  phone: '',
  location: '',
  company: '',
  industry: '',
};

const emptyProfessionalForm = {
  id: null,
  userId: '',
  fullName: '',
  title: '',
  category: '',
  hourlyRate: '',
  location: '',
  bio: '',
  skills: '',
  experience: '',
  availability: 'available',
  completedJobs: '0',
  responseTime: 'New',
  portfolio: '',
  avatar: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ManageData() {
  const [users, setUsers] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [professionalDialogOpen, setProfessionalDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [professionalForm, setProfessionalForm] = useState(emptyProfessionalForm);
  const [isSaving, setIsSaving] = useState(false);
  const [userErrors, setUserErrors] = useState({});
  const [professionalErrors, setProfessionalErrors] = useState({});

  function validateUserForm(form) {
    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailPattern.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!form.role) {
      errors.role = 'Select a role.';
    }

    if (!form.id && !form.password) {
      errors.password = 'Password is required for new users.';
    } else if (form.password && form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    return errors;
  }

  function validateProfessionalForm(form) {
    const errors = {};

    if (!String(form.userId).trim()) {
      errors.userId = 'User ID is required.';
    }

    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!form.title.trim()) {
      errors.title = 'Title is required.';
    }

    if (!form.category) {
      errors.category = 'Select a category.';
    }

    if (!form.hourlyRate) {
      errors.hourlyRate = 'Hourly rate is required.';
    } else if (Number(form.hourlyRate) <= 0) {
      errors.hourlyRate = 'Hourly rate must be greater than 0.';
    }

    if (!form.bio.trim()) {
      errors.bio = 'Bio is required.';
    } else if (form.bio.trim().length < 30) {
      errors.bio = 'Bio should be at least 30 characters.';
    }

    return errors;
  }

  async function loadData() {
    try {
      setIsLoading(true);
      const [usersResponse, professionalsResponse] = await Promise.all([
        fetchUsers(),
        fetchProfessionals(),
      ]);
      setUsers(usersResponse.users || []);
      setProfessionals(professionalsResponse.professionals || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const openCreateUser = () => {
    setUserForm(emptyUserForm);
    setUserErrors({});
    setUserDialogOpen(true);
  };

  const openEditUser = (user) => {
    setUserForm({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      location: user.location || '',
      company: user.company || '',
      industry: user.industry || '',
    });
    setUserErrors({});
    setUserDialogOpen(true);
  };

  const openCreateProfessional = () => {
    setProfessionalForm(emptyProfessionalForm);
    setProfessionalErrors({});
    setProfessionalDialogOpen(true);
  };

  const openEditProfessional = (professional) => {
    setProfessionalForm({
      id: professional.id,
      userId: String(professional.userId || ''),
      fullName: professional.name || '',
      title: professional.title || '',
      category: professional.category || '',
      hourlyRate: String(professional.hourlyRate || ''),
      location: professional.location || '',
      bio: professional.bio || professional.description || '',
      skills: Array.isArray(professional.skills) ? professional.skills.join(', ') : '',
      experience: professional.experience || '',
      availability: professional.availability || 'available',
      completedJobs: String(professional.completedJobs || 0),
      responseTime: professional.responseTime || 'New',
      portfolio: professional.portfolio || '',
      avatar: professional.avatar || '',
    });
    setProfessionalErrors({});
    setProfessionalDialogOpen(true);
  };

  const handleSaveUser = async () => {
    const errors = validateUserForm(userForm);
    setUserErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    try {
      setIsSaving(true);
      if (userForm.id) {
        await updateUser(userForm.id, userForm);
        toast.success('User updated successfully.');
      } else {
        await createUser(userForm);
        toast.success('User created successfully.');
      }
      setUserDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfessional = async () => {
    const errors = validateProfessionalForm(professionalForm);
    setProfessionalErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...professionalForm,
        hourlyRate: Number(professionalForm.hourlyRate),
        completedJobs: Number(professionalForm.completedJobs),
      };

      if (professionalForm.id) {
        await updateProfessional(professionalForm.id, payload);
        toast.success('Professional updated successfully.');
      } else {
        await createProfessional(payload);
        toast.success('Professional created successfully.');
      }
      setProfessionalDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      await deleteUser(id);
      toast.success('User deleted successfully.');
      await loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteProfessional = async (id) => {
    if (!window.confirm('Delete this professional profile?')) {
      return;
    }

    try {
      await deleteProfessional(id);
      toast.success('Professional deleted successfully.');
      await loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Manage Data</h1>
            <p className="text-gray-600">Full CRUD for users and professionals</p>
          </div>
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User CRUD</CardTitle>
                <Button onClick={openCreateUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>{user.location || '-'}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditUser(user)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professionals">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Professional CRUD</CardTitle>
                <Button onClick={openCreateProfessional}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Professional
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {professionals.map((professional) => (
                      <TableRow key={professional.id}>
                        <TableCell>{professional.id}</TableCell>
                        <TableCell>{professional.name}</TableCell>
                        <TableCell>{professional.title}</TableCell>
                        <TableCell>{professional.category}</TableCell>
                        <TableCell>${professional.hourlyRate}/hr</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditProfessional(professional)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProfessional(professional.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{userForm.id ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>Manage user data directly from the frontend.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
              {userErrors.fullName && <p className="text-sm text-red-600">{userErrors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              {userErrors.email && <p className="text-sm text-red-600">{userErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password {userForm.id ? '(leave blank to keep current)' : ''}</Label>
              <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
              {userErrors.password && <p className="text-sm text-red-600">{userErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
              {userErrors.role && <p className="text-sm text-red-600">{userErrors.role}</p>}
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={userForm.location} onChange={(e) => setUserForm({ ...userForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={userForm.company} onChange={(e) => setUserForm({ ...userForm, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={userForm.industry} onChange={(e) => setUserForm({ ...userForm, industry: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save User'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={professionalDialogOpen} onOpenChange={setProfessionalDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{professionalForm.id ? 'Edit Professional' : 'Create Professional'}</DialogTitle>
            <DialogDescription>Manage professional profiles directly from the frontend.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={professionalForm.userId} onChange={(e) => setProfessionalForm({ ...professionalForm, userId: e.target.value })} />
              {professionalErrors.userId && <p className="text-sm text-red-600">{professionalErrors.userId}</p>}
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={professionalForm.fullName} onChange={(e) => setProfessionalForm({ ...professionalForm, fullName: e.target.value })} />
              {professionalErrors.fullName && <p className="text-sm text-red-600">{professionalErrors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={professionalForm.title} onChange={(e) => setProfessionalForm({ ...professionalForm, title: e.target.value })} />
              {professionalErrors.title && <p className="text-sm text-red-600">{professionalErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={professionalForm.category} onValueChange={(value) => setProfessionalForm({ ...professionalForm, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {professionalErrors.category && <p className="text-sm text-red-600">{professionalErrors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label>Hourly Rate</Label>
              <Input type="number" value={professionalForm.hourlyRate} onChange={(e) => setProfessionalForm({ ...professionalForm, hourlyRate: e.target.value })} />
              {professionalErrors.hourlyRate && <p className="text-sm text-red-600">{professionalErrors.hourlyRate}</p>}
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={professionalForm.location} onChange={(e) => setProfessionalForm({ ...professionalForm, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input value={professionalForm.experience} onChange={(e) => setProfessionalForm({ ...professionalForm, experience: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={professionalForm.availability} onValueChange={(value) => setProfessionalForm({ ...professionalForm, availability: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Completed Jobs</Label>
              <Input type="number" value={professionalForm.completedJobs} onChange={(e) => setProfessionalForm({ ...professionalForm, completedJobs: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Response Time</Label>
              <Input value={professionalForm.responseTime} onChange={(e) => setProfessionalForm({ ...professionalForm, responseTime: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Skills</Label>
              <Input value={professionalForm.skills} onChange={(e) => setProfessionalForm({ ...professionalForm, skills: e.target.value })} placeholder="React, Node.js, SQL" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Portfolio URL</Label>
              <Input value={professionalForm.portfolio} onChange={(e) => setProfessionalForm({ ...professionalForm, portfolio: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Avatar URL</Label>
              <Input value={professionalForm.avatar} onChange={(e) => setProfessionalForm({ ...professionalForm, avatar: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Bio</Label>
              <Textarea rows={5} value={professionalForm.bio} onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })} />
              {professionalErrors.bio && <p className="text-sm text-red-600">{professionalErrors.bio}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfessionalDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfessional} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Professional'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
