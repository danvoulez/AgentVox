import React, { useState, useRef, useEffect } from 'react';
import { useVox } from '@/contexts/VoxContext';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface AdvancedVoiceCommandSystemProps {
  onCommandProcessed?: (response: string) => void;
}

const AdvancedVoiceCommandSystem: React.FC<AdvancedVoiceCommandSystemProps> = ({
  onCommandProcessed
}) => {
  const {
    isRecording,
    isProcessing,
    setIsRecording,
    setIsProcessing,
    logCommand,
    currentResponse,
    setCurrentResponse
  } = useVox();

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      setCurrentResponse(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track: any) => track.stop());
        
        // Process the recorded audio
        processAudioWithWhisper(audioBlob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudioWithWhisper = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response: Response = await fetch('/api/vox/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }
      
      const data: any = await response.json();
      setTranscript(data.text);
      
      // Process the transcribed command
      await processVoiceCommand(data.text);
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const processVoiceCommand = async (text: string) => {
    try {
      const response: Response = await fetch('/api/vox/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: text }),
      });
      
      if (!response.ok) {
        throw new Error(`Command processing failed: ${response.statusText}`);
      }
      
      const data: any = await response.json();
      
      // Log the command in the database
      await logCommand(
        text,
        text,
        data.response,
        data.action,
        data.success
      );
      
      // Update the UI with the response
      setCurrentResponse(data.response);
      
      // Execute any actions if needed
      if (data.action && typeof data.action === 'object') {
        executeAction(data.action);
      }
      
      // Notify parent component if callback provided
      if (onCommandProcessed) {
        onCommandProcessed(data.response);
      }
    } catch (err) {
      console.error('Error processing command:', err);
      setError('Failed to process command. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeAction = (action: any) => {
    // Handle different types of actions
    switch (action.type) {
      case 'navigate':
        if (action.url) {
          window.location.href = action.url;
        }
        break;
      case 'playAudio':
        if (action.audioUrl && audioRef.current) {
          audioRef.current.src = action.audioUrl;
          audioRef.current.play();
        }
        break;
      // Add more action types as needed
      default:
        console.log('Unknown action type:', action.type);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-50 rounded-lg shadow-sm">
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex items-center justify-center w-full">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
          
          {isRecording && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm font-medium">{error}</div>
      )}
      
      {transcript && (
        <div className="w-full max-w-md bg-white p-3 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">You said:</h3>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}
      
      {currentResponse && (
        <div className="w-full max-w-md bg-blue-50 p-3 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-blue-500 mb-1">Vox response:</h3>
          <p className="text-gray-800">{currentResponse}</p>
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-2">
        {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Click the microphone to speak'}
      </div>
    </div>
  );
};

export default AdvancedVoiceCommandSystem;
