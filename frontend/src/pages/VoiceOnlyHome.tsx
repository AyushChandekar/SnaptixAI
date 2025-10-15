import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';

export default function VoiceOnlyHome() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ 
      padding: isMobile ? '8px' : '5px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh' 
    }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
        color: 'white',
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        textAlign: 'center',
        marginBottom: isMobile ? '1.5rem' : '3rem',
        borderRadius: '16px'
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '2rem' : '3.5rem', 
          fontWeight: 'bold', 
          margin: '0 0 0.75rem 0' 
        }}>
          Synaptix AI
        </h1>
        <p style={{ 
          fontSize: isMobile ? '1rem' : '1.5rem', 
          opacity: 0.9, 
          maxWidth: isMobile ? '95%' : 'auto', 
          margin: isMobile ? '0 auto 0.25rem auto' : '0 auto -0.1rem auto' 
        }}>
          AI-Powered Voice & Game Analysis for Cognitive Health Screening
        </p>
        <p style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', opacity: 0.8 }}>
          Advanced speech pattern analysis for early detection of cognitive decline
        </p>
      </div>

      {/* Analysis Cards Container */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: isMobile ? '0 0.5rem' : '-20px auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: isMobile ? '1rem' : '2rem',
        padding: isMobile ? '0' : '-20px 20px'
      }}>
        {/* Main Voice Screening Card */}
        <div>
          <div 
            style={{
              backgroundColor: 'white',
              padding: isMobile ? '1rem' : '1.5rem 10px',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              border: '2px solid #e2e8f0',
              height: '100%'
            }}
            onClick={() => navigate('/voice-screening')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {/* Voice Analysis Card Content */}
            <div style={{ 
              backgroundColor: '#3b82f6', 
              borderRadius: '20px', 
              padding: isMobile ? '1rem' : '1.5rem', 
              display: 'inline-block', 
              marginBottom: isMobile ? '1rem' : '2rem' 
            }}>
              <span style={{ fontSize: isMobile ? '3rem' : '4rem', color: 'white' }}>🎤</span>
            </div>
            
            <h2 style={{ 
              fontSize: isMobile ? '1.5rem' : '2.5rem', 
              fontWeight: 'bold', 
              margin: '0 0 0.75rem 0', 
              color: '#1e293b' 
            }}>
              Start Voice Analysis
            </h2>
            
            <p style={{ 
              color: '#64748b', 
              lineHeight: 1.6 as any, 
              margin: '0 0 1.25rem 0',
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Our advanced AI analyzes your speech patterns including pace, pauses, 
              vocabulary richness, and fluency to provide insights into cognitive health.
            </p>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#dbeafe',
              padding: isMobile ? '0.75rem 1.25rem' : '1rem 2rem',
              borderRadius: '50px',
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 'bold',
              color: '#1e40af'
            }}>
              <span style={{ marginRight: '0.5rem' }}>▶</span>
              Click to Begin Assessment
            </div>
          </div>
        </div>

        {/* Main Game Analysis Card */}
        <div>
          <div 
            style={{
              backgroundColor: 'white',
              padding: isMobile ? '1rem' : '1.5rem 10px',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              border: '2px solid #e2e8f0',
              height: '100%'
            }}
            onClick={() => navigate('/game-analysis')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {/* Game Analysis Card Content */}
            <div style={{ 
              backgroundColor: '#3b82f6', 
              borderRadius: '20px', 
              padding: isMobile ? '1rem' : '1.5rem', 
              display: 'inline-block', 
              marginBottom: isMobile ? '1rem' : '2rem' 
            }}>
              <span style={{ fontSize: isMobile ? '3rem' : '4rem', color: 'white' }}>🎮</span>
            </div>
            
            <h2 style={{ 
              fontSize: isMobile ? '1.5rem' : '2.5rem', 
              fontWeight: 'bold', 
              margin: '0 0 0.75rem 0', 
              color: '#1e293b' 
            }}>
              Start Game Analysis
            </h2>
            
            <p style={{ 
              color: '#64748b', 
              lineHeight: 1.6 as any, 
              margin: '0 0 1.25rem 0',
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Our intelligent game analytics evaluate memory, attention, and problem-solving through performance patterns to provide insights into cognitive function.
            </p>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#dbeafe',
              padding: isMobile ? '0.75rem 1.25rem' : '1rem 2rem',
              borderRadius: '50px',
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 'bold',
              color: '#1e40af'
            }}>
              <span style={{ marginRight: '0.5rem' }}>▶</span>
              Click to Begin Assessment
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{
        maxWidth: '1000px',
        margin: isMobile ? '2rem auto' : '7rem auto 3rem',
        backgroundColor: 'white',
        padding: isMobile ? '1.5rem' : '3rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '1.5rem' : '2rem', 
          textAlign: 'center', 
          marginBottom: isMobile ? '1.5rem' : '3rem', 
          color: '#1e293b',
          fontWeight: 'bold'
        }}>
          How Voice Screening Works
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: isMobile ? '1rem' : '2rem' 
        }}>
          {[
            { 
              icon: '🎤', 
              title: 'Record Voice', 
              desc: 'Speak naturally for 30-60 seconds about any topic you choose',
              color: '#3b82f6'
            },
            { 
              icon: '🔄', 
              title: 'AI Processing', 
              desc: 'Advanced algorithms analyze speech patterns, timing, and linguistic features',
              color: '#8b5cf6'
            },
            { 
              icon: '📊', 
              title: 'Get Insights', 
              desc: 'Receive detailed analysis of cognitive markers and health indicators',
              color: '#10b981'
            },
            { 
              icon: '📋', 
              title: 'Review Report', 
              desc: 'Access comprehensive results with explanations and recommendations',
              color: '#f59e0b'
            }
          ].map((step, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: step.color,
                borderRadius: '16px',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'inline-block',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: 'white' }}>{step.icon}</span>
              </div>
              <h4 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#1e293b',
                fontSize: isMobile ? '1.05rem' : '1.2rem',
                fontWeight: 'bold'
              }}>
                {step.title}
              </h4>
              <p style={{ 
                margin: '0', 
                fontSize: isMobile ? '0.9rem' : '0.95rem', 
                color: '#64748b', 
                lineHeight: 1.5 as any 
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

       {/* How Game Analysis Works */}
      <div style={{
        maxWidth: '1000px',
        margin: '3rem auto',
        backgroundColor: 'white',
        padding: isMobile ? '1.5rem' : '3rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '1.5rem' : '2rem', 
          textAlign: 'center', 
          marginBottom: isMobile ? '1.5rem' : '3rem', 
          color: '#1e293b',
          fontWeight: 'bold'
        }}>
          How Game Analysis Works
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: isMobile ? '1rem' : '2rem' 
        }}>
          {[
            { 
              icon: '🎮', 
              title: 'Play Games', 
              desc: 'Engage in interactive cognitive assessment games designed to test various mental functions',
              color: '#3b82f6'
            },
            { 
              icon: '⚡', 
              title: 'Real-time Analysis', 
              desc: 'AI monitors reaction times, decision-making patterns, and problem-solving abilities',
              color: '#8b5cf6'
            },
            { 
              icon: '🧠', 
              title: 'Cognitive Mapping', 
              desc: 'System creates detailed maps of cognitive performance across different domains',
              color: '#10b981'
            },
            { 
              icon: '📊', 
              title: 'Performance Report', 
              desc: 'Get comprehensive analysis of cognitive strengths and areas for attention',
              color: '#f59e0b'
            }
          ].map((step, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: step.color,
                borderRadius: '16px',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'inline-block',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: 'white' }}>{step.icon}</span>
              </div>
              <h4 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#1e293b',
                fontSize: isMobile ? '1.05rem' : '1.2rem',
                fontWeight: 'bold'
              }}>
                {step.title}
              </h4>
              <p style={{ 
                margin: '0', 
                fontSize: isMobile ? '0.9rem' : '0.95rem', 
                color: '#64748b', 
                lineHeight: 1.5 as any 
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

            {/* Key Analysis Features Section */}
      <div style={{
        maxWidth: '1000px',
        margin: '3rem auto 0',
        backgroundColor: 'white',
        padding: isMobile ? '1.5rem' : '3rem',
        borderRadius: '16px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '1.5rem' : '2rem', 
          textAlign: 'center', 
          marginBottom: isMobile ? '1.5rem' : '3rem', 
          color: '#1e293b',
          fontWeight: 'bold'
        }}>
          Key Analysis Features
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: isMobile ? '1rem' : '2rem' 
        }}>
          {[
            { 
              icon: '🗣️', 
              title: 'Speech Analysis', 
              desc: 'Evaluates speech patterns, pauses, and vocal characteristics',
              color: '#3b82f6'
            },
            { 
              icon: '🎯', 
              title: 'Cognitive Testing', 
              desc: 'Assesses memory, attention, and problem-solving abilities',
              color: '#8b5cf6'
            },
            { 
              icon: '⚡', 
              title: 'Response Time', 
              desc: 'Measures reaction speed and decision-making efficiency',
              color: '#10b981'
            },
            { 
              icon: '🧠', 
              title: 'Pattern Recognition', 
              desc: 'Analyzes learning and adaptive behavior patterns',
              color: '#f59e0b'
            },
            { 
              icon: '📊', 
              title: 'Progress Tracking', 
              desc: 'Monitors changes in cognitive performance over time',
              color: '#ef4444'
            },
            { 
              icon: '📈', 
              title: 'Risk Assessment', 
              desc: 'Identifies potential cognitive health concerns early',
              color: '#6366f1'
            }
          ].map((feature, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: feature.color,
                borderRadius: '16px',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'inline-block',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: isMobile ? '2rem' : '2.5rem', color: 'white' }}>{feature.icon}</span>
              </div>
              <h4 style={{ 
                margin: '0 0 0.75rem 0', 
                color: '#1e293b',
                fontSize: isMobile ? '1.05rem' : '1.2rem',
                fontWeight: 'bold'
              }}>
                {feature.title}
              </h4>
              <p style={{ 
                margin: '0', 
                fontSize: isMobile ? '0.9rem' : '0.95rem', 
                color: '#64748b', 
                lineHeight: 1.5 as any 
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '1rem',
        padding: isMobile ? '0.75rem' : '0.9rem',
        backgroundColor: '#1e293b',
        color: 'white',
        borderRadius: '16px'
      }}>
        
        <h4 style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Synaptix AI - Voice & Game Based Cognitive Assessment
        </h4>
        <p style={{ 
          color: '#94a3b8', 
          maxWidth: '600px', 
          margin: '0 auto 1.5rem auto',
          lineHeight: 1.6 as any
        }}>
          Utilizing cutting-edge AI and machine learning to analyze speech patterns for 
          early detection of cognitive changes. Supporting healthcare professionals and 
          individuals in proactive cognitive health monitoring.
        </p>
        <div style={{ 
          borderTop: '1px solid #374151', 
          paddingTop: '1.5rem',
          marginTop: '1.5rem'
        }}>
          <p style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.9rem', margin: '0' }}>
            © 2024 Synaptix AI Platform. This tool provides supplementary information 
            and should not replace professional medical consultation.
          </p>
        </div>
      </footer>
    </div>
  );
}
