import { supabase } from '@/utils/supabaseClient';

/**
 * Serviços para o módulo de Recursos Humanos (RH)
 */

interface Employee {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id: string;
  position_id: string;
  hire_date: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  salary?: number;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id?: string;
  name: string;
  description?: string;
  manager_id?: string;
  parent_department_id?: string;
  active: boolean;
}

interface Position {
  id?: string;
  title: string;
  description?: string;
  department_id: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  active: boolean;
}

interface PerformanceReview {
  id?: string;
  employee_id: string;
  reviewer_id: string;
  review_date: string;
  review_period_start: string;
  review_period_end: string;
  performance_score: number;
  strengths?: string;
  areas_for_improvement?: string;
  goals?: string;
  comments?: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
}

interface TimeOff {
  id?: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  comments?: string;
}

interface Training {
  id?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  provider?: string;
  cost?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface EmployeeTraining {
  id?: string;
  employee_id: string;
  training_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  completion_date?: string;
  certification?: string;
  score?: number;
  comments?: string;
}

// Employee services
export const getEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('hr.employees')
      .select(`
        *,
        department:department_id(id, name),
        position:position_id(id, title)
      `)
      .order('last_name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { data: null, error };
  }
};

export const getEmployee = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('hr.employees')
      .select(`
        *,
        department:department_id(id, name),
        position:position_id(id, title)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createEmployee = async (employee: Employee) => {
  try {
    const { data, error } = await supabase
      .from('hr.employees')
      .insert(employee)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { data: null, error };
  }
};

export const updateEmployee = async (id: string, employee: Partial<Employee>) => {
  try {
    const { data, error } = await supabase
      .from('hr.employees')
      .update(employee)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    return { error };
  }
};

// Department services
export const getDepartments = async () => {
  try {
    const { data, error } = await supabase
      .from('hr.departments')
      .select(`
        *,
        manager:manager_id(id, first_name, last_name),
        parent_department:parent_department_id(id, name)
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { data: null, error };
  }
};

export const getDepartment = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('hr.departments')
      .select(`
        *,
        manager:manager_id(id, first_name, last_name),
        parent_department:parent_department_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching department with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createDepartment = async (department: Department) => {
  try {
    const { data, error } = await supabase
      .from('hr.departments')
      .insert(department)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating department:', error);
    return { data: null, error };
  }
};

export const updateDepartment = async (id: string, department: Partial<Department>) => {
  try {
    const { data, error } = await supabase
      .from('hr.departments')
      .update(department)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating department with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting department with ID ${id}:`, error);
    return { error };
  }
};

// Position services
export const getPositions = async (departmentId?: string) => {
  try {
    let query = supabase
      .from('hr.positions')
      .select(`
        *,
        department:department_id(id, name)
      `)
      .order('title', { ascending: true });
    
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching positions:', error);
    return { data: null, error };
  }
};

export const getPosition = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('hr.positions')
      .select(`
        *,
        department:department_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching position with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createPosition = async (position: Position) => {
  try {
    const { data, error } = await supabase
      .from('hr.positions')
      .insert(position)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating position:', error);
    return { data: null, error };
  }
};

export const updatePosition = async (id: string, position: Partial<Position>) => {
  try {
    const { data, error } = await supabase
      .from('hr.positions')
      .update(position)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating position with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deletePosition = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.positions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting position with ID ${id}:`, error);
    return { error };
  }
};

// Performance Review services
export const getPerformanceReviews = async (employeeId?: string) => {
  try {
    let query = supabase
      .from('hr.performance_reviews')
      .select(`
        *,
        employee:employee_id(id, first_name, last_name),
        reviewer:reviewer_id(id, first_name, last_name)
      `)
      .order('review_date', { ascending: false });
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    return { data: null, error };
  }
};

export const getPerformanceReview = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('hr.performance_reviews')
      .select(`
        *,
        employee:employee_id(id, first_name, last_name),
        reviewer:reviewer_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching performance review with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createPerformanceReview = async (review: PerformanceReview) => {
  try {
    const { data, error } = await supabase
      .from('hr.performance_reviews')
      .insert(review)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating performance review:', error);
    return { data: null, error };
  }
};

export const updatePerformanceReview = async (id: string, review: Partial<PerformanceReview>) => {
  try {
    const { data, error } = await supabase
      .from('hr.performance_reviews')
      .update(review)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating performance review with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deletePerformanceReview = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.performance_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting performance review with ID ${id}:`, error);
    return { error };
  }
};

// Time Off services
export const getTimeOffRequests = async (employeeId?: string, status?: string) => {
  try {
    let query = supabase
      .from('hr.time_off')
      .select(`
        *,
        employee:employee_id(id, first_name, last_name),
        approver:approved_by(id, first_name, last_name)
      `)
      .order('start_date', { ascending: false });
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching time off requests:', error);
    return { data: null, error };
  }
};

export const getTimeOff = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('hr.time_off')
      .select(`
        *,
        employee:employee_id(id, first_name, last_name),
        approver:approved_by(id, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching time off request with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createTimeOff = async (timeOff: TimeOff) => {
  try {
    const { data, error } = await supabase
      .from('hr.time_off')
      .insert(timeOff)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating time off request:', error);
    return { data: null, error };
  }
};

export const updateTimeOff = async (id: string, timeOff: Partial<TimeOff>) => {
  try {
    const { data, error } = await supabase
      .from('hr.time_off')
      .update(timeOff)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating time off request with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteTimeOff = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.time_off')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting time off request with ID ${id}:`, error);
    return { error };
  }
};

// Training services
export const getTrainings = async () => {
  try {
    const { data, error } = await supabase
      .from('hr.trainings')
      .select(`*`)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return { data: null, error };
  }
};

export const getTraining = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('hr.trainings')
      .select(`*`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching training with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createTraining = async (training: Training) => {
  try {
    const { data, error } = await supabase
      .from('hr.trainings')
      .insert(training)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating training:', error);
    return { data: null, error };
  }
};

export const updateTraining = async (id: string, training: Partial<Training>) => {
  try {
    const { data, error } = await supabase
      .from('hr.trainings')
      .update(training)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating training with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteTraining = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.trainings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting training with ID ${id}:`, error);
    return { error };
  }
};

// Employee Training services
export const getEmployeeTrainings = async (employeeId?: string, trainingId?: string) => {
  try {
    let query = supabase
      .from('hr.employee_trainings')
      .select(`
        *,
        employee:employee_id(id, first_name, last_name),
        training:training_id(id, title, description)
      `);
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    
    if (trainingId) {
      query = query.eq('training_id', trainingId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching employee trainings:', error);
    return { data: null, error };
  }
};

export const assignTrainingToEmployee = async (employeeTraining: EmployeeTraining) => {
  try {
    const { data, error } = await supabase
      .from('hr.employee_trainings')
      .insert(employeeTraining)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error assigning training to employee:', error);
    return { data: null, error };
  }
};

export const updateEmployeeTraining = async (id: string, employeeTraining: Partial<EmployeeTraining>) => {
  try {
    const { data, error } = await supabase
      .from('hr.employee_trainings')
      .update(employeeTraining)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating employee training with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const removeEmployeeTraining = async (id: string) => {
  try {
    const { error } = await supabase
      .from('hr.employee_trainings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error removing employee training with ID ${id}:`, error);
    return { error };
  }
};
