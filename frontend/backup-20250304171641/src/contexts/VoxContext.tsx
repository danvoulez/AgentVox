import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';
import embeddingService from '@/utils/embeddingService';

// Define types for our context
export type VoxMemory = {
  id: string;
  memoryType: string;
  content: any;
  importance: number;
  metadata?: {
    embeddingId?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
};

export type VoxEvolution = {
  id: string;
  intelligenceLevel: number;
  learningPoints: number;
  skills: Record<string, number>;
  stats: {
    accuracy: number;
    helpfulness: number;
    creativity: number;
    efficiency: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type VoxCommand = {
  id: string;
  command: string;
  transcript: string;
  response?: string;
  action?: any;
  success: boolean;
  createdAt: string;
};

type VoxContextType = {
  user: User | null;
  isLoading: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  memories: VoxMemory[];
  evolution: VoxEvolution | null;
  commandHistory: VoxCommand[];
  currentResponse: string | null;
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  addMemory: (memory: Omit<VoxMemory, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed'>) => Promise<string | null>;
  updateMemory: (id: string, content: any) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;
  retrieveRelevantMemories: (query: string, options?: { memoryType?: string, minSimilarity?: number, limit?: number }) => Promise<VoxMemory[]>;
  logCommand: (command: string, transcript: string, response?: string, action?: any, success?: boolean) => Promise<string | null>;
  getCommandHistory: (limit?: number) => Promise<VoxCommand[]>;
  updateEvolution: (updates: Partial<Omit<VoxEvolution, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>;
  setCurrentResponse: (response: string | null) => void;
  signOut: () => Promise<void>;
};

const VoxContext = createContext<VoxContextType | undefined>(undefined);

export const VoxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [memories, setMemories] = useState<VoxMemory[]>([]);
  const [evolution, setEvolution] = useState<VoxEvolution | null>(null);
  const [commandHistory, setCommandHistory] = useState<VoxCommand[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);

  // Initialize user on load
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          setUser(null);
          resetUserData();
        }
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load memories
      const { data: memoriesData, error: memoriesError } = await supabase
        .from('vox_memory')
        .select('*')
        .eq('user_id', userId)
        .order('importance', { ascending: false });

      if (memoriesError) throw memoriesError;
      
      // Format the memories data
      const formattedMemories = memoriesData.map(memory => ({
        id: memory.id,
        memoryType: memory.memory_type,
        content: memory.content,
        importance: memory.importance,
        createdAt: memory.created_at,
        updatedAt: memory.updated_at,
        lastAccessed: memory.last_accessed
      }));
      
      setMemories(formattedMemories);

      // Load evolution data
      const { data: evolutionData, error: evolutionError } = await supabase
        .from('vox_evolution')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (evolutionError && evolutionError.code !== 'PGRST116') {
        throw evolutionError;
      }

      if (evolutionData) {
        setEvolution({
          id: evolutionData.id,
          intelligenceLevel: evolutionData.intelligence_level,
          learningPoints: evolutionData.learning_points,
          skills: evolutionData.skills,
          stats: evolutionData.stats,
          createdAt: evolutionData.created_at,
          updatedAt: evolutionData.updated_at
        });
      } else {
        // Create initial evolution record if it doesn't exist
        const { data: newEvolution, error: createError } = await supabase
          .from('vox_evolution')
          .insert([
            { 
              user_id: userId,
              intelligence_level: 1,
              learning_points: 0,
              skills: {},
              stats: { accuracy: 0, helpfulness: 0, creativity: 0, efficiency: 0 }
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        
        if (newEvolution) {
          setEvolution({
            id: newEvolution.id,
            intelligenceLevel: newEvolution.intelligence_level,
            learningPoints: newEvolution.learning_points,
            skills: newEvolution.skills,
            stats: newEvolution.stats,
            createdAt: newEvolution.created_at,
            updatedAt: newEvolution.updated_at
          });
        }
      }

      // Load command history
      const { data: commandsData, error: commandsError } = await supabase
        .from('voice_commands')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commandsError) throw commandsError;
      
      const formattedCommands = commandsData.map(cmd => ({
        id: cmd.id,
        command: cmd.command,
        transcript: cmd.transcript,
        response: cmd.response,
        action: cmd.action,
        success: cmd.success,
        createdAt: cmd.created_at
      }));
      
      setCommandHistory(formattedCommands);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const resetUserData = () => {
    setMemories([]);
    setEvolution(null);
    setCommandHistory([]);
    setCurrentResponse(null);
  };

  const addMemory = async (memory: Omit<VoxMemory, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed'>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('vox_memory')
        .insert([
          {
            user_id: user.id,
            memory_type: memory.memoryType,
            content: memory.content,
            importance: memory.importance || 1
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      const newMemory = {
        id: data.id,
        memoryType: data.memory_type,
        content: data.content,
        importance: data.importance,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastAccessed: data.last_accessed
      };
      
      setMemories(prev => [newMemory, ...prev]);
      
      return data.id;
    } catch (error) {
      console.error('Error adding memory:', error);
      return null;
    }
  };

  const updateMemory = async (id: string, content: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('vox_memory')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setMemories(prev => 
        prev.map(memory => 
          memory.id === id 
            ? { ...memory, content, updatedAt: new Date().toISOString() } 
            : memory
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating memory:', error);
      return false;
    }
  };

  const deleteMemory = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('vox_memory')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setMemories(prev => prev.filter(memory => memory.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  };

  const retrieveRelevantMemories = async (query: string): Promise<VoxMemory[]> => {
    if (!user) return [];
    
    try {
      // This would typically call an API endpoint that generates embeddings and performs similarity search
      const response = await fetch('/api/vox/memory/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to retrieve memories');
      }
      
      const data = await response.json();
      return data.memories;
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  };

  const logCommand = async (
    command: string, 
    transcript: string, 
    response?: string, 
    action?: any, 
    success: boolean = true
  ): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('voice_commands')
        .insert([
          {
            user_id: user.id,
            command,
            transcript,
            response,
            action,
            success
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      const newCommand = {
        id: data.id,
        command: data.command,
        transcript: data.transcript,
        response: data.response,
        action: data.action,
        success: data.success,
        createdAt: data.created_at
      };
      
      setCommandHistory(prev => [newCommand, ...prev]);
      
      // Update learning points in evolution
      if (evolution) {
        await updateEvolution({
          learningPoints: evolution.learningPoints + 1
        });
      }
      
      return data.id;
    } catch (error) {
      console.error('Error logging command:', error);
      return null;
    }
  };

  const getCommandHistory = async (limit: number = 10): Promise<VoxCommand[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('voice_commands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data.map((cmd: any) => ({
        id: cmd.id,
        command: cmd.command,
        transcript: cmd.transcript,
        response: cmd.response,
        action: cmd.action,
        success: cmd.success,
        createdAt: cmd.created_at
      }));
    } catch (error) {
      console.error('Error fetching command history:', error);
      return [];
    }
  };

  const updateEvolution = async (
    updates: Partial<Omit<VoxEvolution, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> => {
    if (!user || !evolution) return false;
    
    try {
      // Convert camelCase to snake_case for Supabase
      const formattedUpdates: Record<string, any> = {};
      
      if ('intelligenceLevel' in updates) {
        formattedUpdates.intelligence_level = updates.intelligenceLevel;
      }
      
      if ('learningPoints' in updates) {
        formattedUpdates.learning_points = updates.learningPoints;
      }
      
      if ('skills' in updates) {
        formattedUpdates.skills = updates.skills;
      }
      
      if ('stats' in updates) {
        formattedUpdates.stats = updates.stats;
      }
      
      const { error } = await supabase
        .from('vox_evolution')
        .update(formattedUpdates)
        .eq('id', evolution.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update local state
      setEvolution(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error updating evolution:', error);
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    resetUserData();
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isRecording,
    isProcessing,
    memories,
    evolution,
    commandHistory,
    currentResponse,
    setIsRecording,
    setIsProcessing,
    addMemory,
    updateMemory,
    deleteMemory,
    retrieveRelevantMemories,
    logCommand,
    getCommandHistory,
    updateEvolution,
    setCurrentResponse,
    signOut
  };

  return <VoxContext.Provider value={value}>{children}</VoxContext.Provider>;
};

export const useVox = () => {
  const context = useContext(VoxContext);
  if (context === undefined) {
    throw new Error('useVox must be used within a VoxProvider');
  }
  return context;
};
