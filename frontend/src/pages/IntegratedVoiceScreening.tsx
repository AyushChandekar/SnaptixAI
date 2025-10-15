  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useIsMobile } from '../hooks/use-mobile';

  interface AnalysisResult {
    riskScore: number
    explanation: string
    metrics: {
      speechRate: number
      pauseCount: number
      vocabularyRichness: number
      fluencyScore: number
    }
  }

  export default function IntegratedVoiceScreening() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [transcript, setTranscript] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<'record' | 'transcribe' | 'analyze' | 'results'>('record');
    const [backendHealth, setBackendHealth] = useState<boolean | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [, setAudioChunks] = useState<Blob[]>([]);

    useEffect(() => {
      checkBackendHealth();
    }, []);

    const checkBackendHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        setBackendHealth(response.ok);
      } catch (error) {
        setBackendHealth(false);
      }
    };

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          handleAudioRecorded(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setAudioChunks(chunks);
      } catch (err) {
        setError('Failed to access microphone. Please allow microphone permission and try again.');
      }
    };

    const stopRecording = () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    };

    const handleAudioRecorded = async (audioBlob: Blob) => {
      setIsProcessing(true);
      setError('');
      setCurrentStep('transcribe');
      
      try {
        // First, transcribe the audio
        const transcriptResponse = await transcribeAudio(audioBlob);
        setTranscript(transcriptResponse.transcript);
        setCurrentStep('analyze');
        
        // Then, analyze the transcript
        const analysisResponse = await analyzeTranscript(
          transcriptResponse.transcript, 
          {
            duration: transcriptResponse.duration,
            fileSize: audioBlob.size
          }
        );
        setAnalysisResult(analysisResponse);
        setCurrentStep('results');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCurrentStep('record');
      } finally {
        setIsProcessing(false);
      }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      return response.json();
    };

    const analyzeTranscript = async (transcript: string, metadata: any) => {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcript, metadata })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze transcript');
      }
      
      return response.json();
    };

    const resetAnalysis = () => {
      setTranscript('');
      setAnalysisResult(null);
      setError('');
      setCurrentStep('record');
      setIsRecording(false);
      setMediaRecorder(null);
      setAudioChunks([]);
    };

    return (
      <div style={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8fafc',
        overflow: 'hidden'
      }}>
        {/* Compact Header */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '10px 12px' : '16px 32px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          flexShrink: 0,
          gap: isMobile ? '8px' : '16px'
        }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: isMobile ? '6px 10px' : '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '14px',
              flexShrink: 0
            }}
          >
            ← {isMobile ? '' : 'Back'}
          </button>
          
          <h1 style={{ 
            fontSize: isMobile ? '1rem' : '1.75rem',
            margin: 0,
            color: '#1e293b',
            fontWeight: '600',
            whiteSpace: isMobile ? 'nowrap' : 'normal',
            overflow: isMobile ? 'hidden' : 'visible',
            textOverflow: isMobile ? 'ellipsis' : 'clip'
          }}>
            {isMobile ? '🎤 Voice' : '🎤 Voice Screening'}
          </h1>

          {/* Backend Status Indicator */}
          {backendHealth !== null && (
            <div style={{
              padding: isMobile ? '4px 8px' : '6px 12px',
              backgroundColor: backendHealth ? '#d1fae5' : '#fef3c7',
              border: `1px solid ${backendHealth ? '#10b981' : '#fbbf24'}`,
              borderRadius: '6px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              color: backendHealth ? '#065f46' : '#92400e',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              {backendHealth ? (isMobile ? '✅' : '✅ Connected') : (isMobile ? '⚠️' : '⚠️ Offline')}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          padding: isMobile ? '12px' : '24px 32px',
          gap: isMobile ? '12px' : '24px',
          overflow: isMobile ? 'auto' : 'hidden',
          minHeight: 0
        }}>
          {/* Left Column - Recording Control */}
          <div style={{
            flex: isMobile ? 'none' : '0 0 400px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '16px',
            minHeight: isMobile ? 'auto' : 0
          }}>
            {/* Recording Interface */}
            <div style={{
              backgroundColor: 'white',
              padding: isMobile ? '16px' : '24px',
              borderRadius: isMobile ? '10px' : '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center',
              flex: isMobile ? 'none' : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: isMobile ? '200px' : 'auto'
            }}>
              {!isRecording && !isProcessing && !transcript && (
                <>
                  <div style={{ fontSize: isMobile ? '2.5rem' : '4rem', marginBottom: isMobile ? '12px' : '20px' }}>🎤</div>
                  <button
                    onClick={startRecording}
                    disabled={!backendHealth}
                    style={{
                      padding: isMobile ? '12px 24px' : '14px 28px',
                      backgroundColor: backendHealth ? '#3b82f6' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: backendHealth ? 'pointer' : 'not-allowed',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      fontWeight: '600',
                      marginBottom: isMobile ? '8px' : '12px',
                      width: isMobile ? '100%' : 'auto',
                      maxWidth: isMobile ? '300px' : 'none'
                    }}
                  >
                    Start Recording
                  </button>
                  <p style={{ color: '#6b7280', fontSize: isMobile ? '0.85rem' : '0.9rem', margin: 0 }}>
                    Click to start voice analysis
                  </p>
                </>
              )}

              {isRecording && (
                <>
                  <div style={{ 
                    fontSize: isMobile ? '3rem' : '4rem', 
                    marginBottom: isMobile ? '12px' : '20px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>
                    🔴
                  </div>
                  <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', color: '#dc2626', marginBottom: isMobile ? '8px' : '12px', fontWeight: 'bold' }}>
                    Recording...
                  </p>
                  <p style={{ color: '#6b7280', marginBottom: isMobile ? '12px' : '20px', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                    Speak clearly for 30-60 seconds
                  </p>
                  <button
                    onClick={stopRecording}
                    style={{
                      padding: isMobile ? '12px 24px' : '14px 28px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      fontWeight: '600',
                      width: isMobile ? '100%' : 'auto',
                      maxWidth: isMobile ? '300px' : 'none'
                    }}
                  >
                    Stop Recording
                  </button>
                </>
              )}

              {isProcessing && (
                <>
                  <div style={{ fontSize: isMobile ? '2.5rem' : '3rem', marginBottom: isMobile ? '12px' : '20px' }}>⌜</div>
                  <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', color: '#2563eb', marginBottom: isMobile ? '6px' : '8px', fontWeight: 'bold' }}>
                    {currentStep === 'transcribe' && 'Converting speech...'}
                    {currentStep === 'analyze' && 'Analyzing patterns...'}
                    {currentStep === 'results' && 'Generating results...'}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: isMobile ? '0.8rem' : '0.85rem', margin: 0 }}>
                    Processing your speech
                  </p>
                </>
              )}
              
              {(transcript || analysisResult) && (
                <>
                  <div style={{ fontSize: isMobile ? '2.5rem' : '3rem', marginBottom: isMobile ? '12px' : '20px' }}>✅</div>
                  <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', color: '#16a34a', marginBottom: isMobile ? '8px' : '12px', fontWeight: 'bold' }}>
                    Analysis Complete
                  </p>
                  <button
                    onClick={resetAnalysis}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '0.9rem' : '0.95rem',
                      fontWeight: '600',
                      width: isMobile ? '100%' : 'auto',
                      maxWidth: isMobile ? '300px' : 'none'
                    }}
                  >
                    Start New Analysis
                  </button>
                </>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: isMobile ? '8px' : '8px',
                padding: isMobile ? '10px' : '12px',
                fontSize: isMobile ? '0.8rem' : '0.85rem'
              }}>
                <p style={{ color: '#dc2626', margin: '0', fontWeight: 'bold' }}>
                  ❌ {error}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '16px',
            overflow: 'auto',
            minHeight: isMobile ? 'auto' : 0
          }}>
            {/* Instructions (shown when no results) */}
            {!transcript && !isProcessing && !isRecording && (
              <div style={{
                backgroundColor: 'white',
                padding: isMobile ? '16px' : '24px',
                borderRadius: isMobile ? '10px' : '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                height: isMobile ? 'auto' : '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', textAlign: 'center', marginBottom: isMobile ? '16px' : '24px', color: '#1e293b', marginTop: 0 }}>
                  How It Works
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)', 
                  gap: isMobile ? '12px' : '20px'
                }}>
                  {[
                    { icon: '🎤', title: 'Record', desc: 'Click to start voice capture' },
                    { icon: '💬', title: 'Speak', desc: 'Talk for 30-60 seconds' },
                    { icon: '⏹️', title: 'Stop', desc: 'End recording and analyze' },
                    { icon: '📄', title: 'Review', desc: 'View transcript and analysis' }
                  ].map((step, index) => (
                    <div key={index} style={{ textAlign: 'center', padding: isMobile ? '8px' : '12px' }}>
                      <div style={{ fontSize: isMobile ? '1.75rem' : '2rem', marginBottom: isMobile ? '6px' : '8px' }}>{step.icon}</div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>{step.title}</h4>
                      <p style={{ margin: '0', fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#6b7280', lineHeight: 1.4 as any }}>
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: isMobile ? '16px' : '24px', textAlign: 'center', paddingTop: isMobile ? '12px' : '20px', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#6b7280', fontSize: isMobile ? '0.7rem' : '0.8rem', margin: 0, lineHeight: 1.5 as any }}>
                    This tool analyzes speech patterns for cognitive insights.<br/>
                    Not a replacement for professional medical advice.
                  </p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {(transcript || analysisResult) && (
              <>
                {/* Transcript */}
                {transcript && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: isMobile ? '16px' : '20px',
                    borderRadius: isMobile ? '10px' : '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    flex: analysisResult && !isMobile ? '1' : 'none',
                    minHeight: 0
                  }}>
                    <h3 style={{ color: '#1e293b', marginTop: 0, marginBottom: isMobile ? '10px' : '12px', fontSize: isMobile ? '1rem' : '1.1rem' }}>📝 Transcript</h3>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      maxHeight: isMobile ? '200px' : (analysisResult ? 'calc(50vh - 140px)' : '300px'),
                      overflow: 'auto',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      lineHeight: 1.6 as any,
                      color: '#374151'
                    }}>
                      {transcript}
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {analysisResult && (
                  <div style={{
                    backgroundColor: 'white',
                    padding: isMobile ? '16px' : '20px',
                    borderRadius: isMobile ? '10px' : '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    flex: isMobile ? 'none' : 1,
                    minHeight: 0,
                    overflow: 'auto'
                  }}>
                    <h3 style={{ color: '#1e293b', marginTop: 0, marginBottom: isMobile ? '10px' : '12px', fontSize: isMobile ? '1rem' : '1.1rem' }}>📊 Analysis Results</h3>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '10px' : '12px', 
                      marginBottom: isMobile ? '12px' : '16px' 
                    }}>
                      {/* Risk Score */}
                      <div style={{
                        flex: isMobile ? 'none' : '0 0 120px',
                        backgroundColor: analysisResult.riskScore > 50 ? '#fef2f2' : '#f0fdf4',
                        border: `2px solid ${analysisResult.riskScore > 50 ? '#fca5a5' : '#bbf7d0'}`,
                        borderRadius: '8px',
                        padding: isMobile ? '12px' : '16px',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? '1.5rem' : '1.75rem', 
                          fontWeight: 'bold',
                          color: analysisResult.riskScore > 50 ? '#dc2626' : '#16a34a'
                        }}>
                          {analysisResult.riskScore}%
                        </div>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                          color: analysisResult.riskScore > 50 ? '#dc2626' : '#16a34a',
                          fontWeight: '600'
                        }}>
                          Risk Score
                        </p>
                      </div>

                      {/* Metrics Grid */}
                      <div style={{ 
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: isMobile ? '6px' : '8px'
                      }}>
                        {[
                          { label: 'Speech Rate', value: analysisResult.metrics.speechRate },
                          { label: 'Pause Count', value: analysisResult.metrics.pauseCount },
                          { label: 'Vocabulary', value: analysisResult.metrics.vocabularyRichness },
                          { label: 'Fluency', value: analysisResult.metrics.fluencyScore }
                        ].map((metric, idx) => (
                          <div key={idx} style={{
                            backgroundColor: '#f8fafc',
                            padding: isMobile ? '8px' : '10px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', color: '#6b7280', marginBottom: '2px' }}>
                              {metric.label}
                            </div>
                            <div style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 'bold', color: '#1e293b' }}>
                              {metric.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{ color: '#374151', margin: '0 0 8px 0', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>Analysis:</h4>
                      <p style={{ margin: '0', fontSize: isMobile ? '0.8rem' : '0.85rem', color: '#6b7280', lineHeight: 1.5 as any }}>
                        {analysisResult.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }
