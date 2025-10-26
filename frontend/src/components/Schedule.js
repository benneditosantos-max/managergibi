import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  User,
  DollarSign,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays
} from 'lucide-react';
import axios from 'axios';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Schedule = () => {
  const { user, API } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    client_id: '',
    date: '',
    time: '',
    duration_hours: '',
    job_type: 'regular',
    price_charged: '',
    helper_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const requests = [axios.get(`${API}/jobs`)];
      
      if (user.role === 'admin') {
        requests.push(
          axios.get(`${API}/clients`),
          axios.get(`${API}/helpers`)
        );
      }

      const responses = await Promise.all(requests);
      
      setJobs(responses[0].data);
      if (responses[1]) setClients(responses[1].data);
      if (responses[2]) setHelpers(responses[2].data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Combine date and time into datetime
      const datetime = new Date(`${formData.date}T${formData.time}`);
      
      const payload = {
        client_id: formData.client_id,
        date: datetime.toISOString(),
        duration_hours: parseFloat(formData.duration_hours),
        job_type: formData.job_type,
        price_charged: parseFloat(formData.price_charged),
        helper_id: formData.helper_id || null,
        notes: formData.notes || null
      };

      if (editingJob) {
        await axios.put(`${API}/jobs/${editingJob.id}`, payload);
        toast.success('Job updated successfully');
      } else {
        await axios.post(`${API}/jobs`, payload);
        toast.success('Job created successfully');
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(error.response?.data?.detail || 'Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    const jobDate = new Date(job.date);
    setFormData({
      client_id: job.client_id,
      date: jobDate.toISOString().split('T')[0],
      time: jobDate.toTimeString().slice(0, 5),
      duration_hours: job.duration_hours.toString(),
      job_type: job.job_type,
      price_charged: job.price_charged.toString(),
      helper_id: job.helper_id || '',
      notes: job.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await axios.put(`${API}/jobs/${jobId}`, { status: newStatus });
      toast.success('Job status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCompleteJob = async (job) => {
    const actualDuration = prompt(`How many hours did this job actually take? (Original estimate: ${job.duration_hours}h)`, job.duration_hours);
    
    if (actualDuration && !isNaN(actualDuration)) {
      try {
        const response = await axios.put(`${API}/jobs/${job.id}/complete`, {
          actual_duration: parseFloat(actualDuration),
          notes: `Job completed. Actual duration: ${actualDuration}h`
        });
        
        toast.success(`Job completed! Net profit: ${response.data.net_profit ? '$' + response.data.net_profit.toFixed(2) : 'N/A'}`);
        fetchData();
      } catch (error) {
        console.error('Error completing job:', error);
        toast.error('Failed to complete job');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      date: '',
      time: '',
      duration_hours: '',
      job_type: 'regular',
      price_charged: '',
      helper_id: '',
      notes: ''
    });
    setEditingJob(null);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calendar functions
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getJobsForDay = (day) => {
    return filteredJobs.filter(job => {
      const jobDate = new Date(job.date);
      return isSameDay(jobDate, day);
    });
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-primary border-primary hover:bg-primary/10"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Visualização:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-primary/10 text-primary border-primary' : ''}
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-primary/10 text-primary border-primary' : ''}
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Calendário
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-primary py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const dayJobs = getJobsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={`
                    min-h-[100px] p-2 border rounded-lg
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                    ${isCurrentDay ? 'border-primary border-2 bg-primary/5' : 'border-gray-200'}
                    hover:shadow-md transition-shadow cursor-pointer
                  `}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {dayJobs.length > 0 && isCurrentMonth && (
                    <div className="space-y-1">
                      {dayJobs.slice(0, 3).map((job) => (
                        <div
                          key={job.id}
                          className={`
                            text-xs p-1 rounded truncate
                            ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'}
                          `}
                          title={`${job.client_name} - ${format(new Date(job.date), 'HH:mm')}`}
                        >
                          {format(new Date(job.date), 'HH:mm')} {job.client_name}
                        </div>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayJobs.length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen" data-testid="schedule-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os agendamentos de limpeza
          </p>
        </div>
        
        {user.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                className="bg-primary hover:bg-primary/90"
                data-testid="add-job-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingJob ? 'Edit Job' : 'Create New Job'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="job-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_id">Client</Label>
                    <select
                      id="client_id"
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleInputChange}
                      required
                      data-testid="client-select"
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="helper_id">Helper (Optional)</Label>
                    <select
                      id="helper_id"
                      name="helper_id"
                      value={formData.helper_id}
                      onChange={handleInputChange}
                      data-testid="helper-select"
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Unassigned</option>
                      {helpers.map(helper => (
                        <option key={helper.id} value={helper.id}>
                          {helper.name} - ${helper.hourly_rate}/hr
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      data-testid="date-input"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      data-testid="time-input"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_hours">Duration (hours)</Label>
                    <Input
                      id="duration_hours"
                      name="duration_hours"
                      type="number"
                      step="0.5"
                      value={formData.duration_hours}
                      onChange={handleInputChange}
                      placeholder="2.5"
                      required
                      data-testid="duration-input"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price_charged">Price ($)</Label>
                    <Input
                      id="price_charged"
                      name="price_charged"
                      type="number"
                      step="0.01"
                      value={formData.price_charged}
                      onChange={handleInputChange}
                      placeholder="150.00"
                      required
                      data-testid="price-input"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="job_type">Job Type</Label>
                  <select
                    id="job_type"
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                    data-testid="job-type-select"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="regular">Regular Cleaning</option>
                    <option value="deep">Deep Cleaning</option>
                    <option value="move_in_out">Move In/Out</option>
                    <option value="office">Office Cleaning</option>
                    <option value="airbnb">Airbnb Cleaning</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special instructions or notes..."
                    data-testid="notes-input"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="cancel-button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    data-testid="save-job-button"
                  >
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by client name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          data-testid="status-filter"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>{filteredJobs.length} jobs</span>
        </div>
      </div>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        renderCalendarView()
      ) : (
        /* Jobs List */
        <div className="space-y-4" data-testid="jobs-list">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">
                  {user.role === 'admin' 
                    ? 'Create your first cleaning job to get started' 
                    : 'No jobs assigned to you yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow" data-testid={`job-card-${job.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.client_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(job.date)} • {job.duration_hours}h</span>
                          </div>
                          {job.helper_name && (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>{job.helper_name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700">
                              {formatCurrency(job.price_charged)}
                            </span>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {job.job_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        {job.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{job.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {/* Status Update Buttons */}
                      {user.role === 'admin' || (user.role === 'helper' && job.helper_id === user.id) ? (
                        <div className="flex space-x-2">
                          {job.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white"
                              data-testid={`start-job-${job.id}`}
                            >
                              Start
                            </Button>
                          )}
                          
                          {job.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteJob(job)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              data-testid={`complete-job-${job.id}`}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      ) : null}
                      
                      {/* Edit Button (Admin only) */}
                      {user.role === 'admin' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(job)}
                            data-testid={`edit-job-${job.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(job.id, 'cancelled')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            data-testid={`cancel-job-${job.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Schedule;