import re
import logging
import nltk
from typing import Dict, Any, List, Tuple
from collections import Counter
import math

logger = logging.getLogger(__name__)

# Download required NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class SpeechAnalyzer:
    """
    Heuristic-based speech analysis for early dementia detection
    Uses speech patterns, vocabulary, fluency, and linguistic features
    """
    
    def __init__(self):
        # Common filler words and hesitations
        self.filler_words = {
            'um', 'uh', 'er', 'ah', 'well', 'you know', 'like', 'so',
            'basically', 'actually', 'i mean', 'sort of', 'kind of'
        }
        
        # Words that might indicate word-finding difficulties
        self.word_finding_indicators = {
            'thing', 'stuff', 'what do you call it', 'whatchamacallit',
            'thingy', 'whatsit', 'that thing', 'you know what i mean'
        }
        
        # Semantic fluency categories (animals, fruits, etc.)
        self.semantic_categories = {
            'animals': {
                'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep',
                'chicken', 'duck', 'rabbit', 'mouse', 'elephant', 'lion', 'tiger'
            },
            'fruits': {
                'apple', 'banana', 'orange', 'grape', 'strawberry', 'peach',
                'pear', 'cherry', 'plum', 'watermelon', 'pineapple', 'mango'
            }
        }
        
        logger.info("SpeechAnalyzer initialized")
    
    def analyze(self, transcript: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main analysis function that combines multiple heuristics
        """
        if not transcript or not transcript.strip():
            raise ValueError("Transcript cannot be empty")
        
        # Clean and prepare text
        cleaned_text = self._clean_text(transcript)
        words = self._tokenize_words(cleaned_text)
        sentences = self._tokenize_sentences(cleaned_text)
        
        # Calculate individual metrics
        speech_rate = self._calculate_speech_rate(words, metadata)
        pause_count = self._estimate_pause_count(transcript)
        vocabulary_richness = self._calculate_vocabulary_richness(words)
        fluency_score = self._calculate_fluency_score(transcript, words)
        semantic_fluency = self._analyze_semantic_fluency(words)
        syntactic_complexity = self._analyze_syntactic_complexity(sentences)
        repetition_score = self._analyze_repetitions(words)
        word_finding_difficulty = self._analyze_word_finding(transcript, words)
        
        # Combine metrics into overall risk score
        risk_score = self._calculate_risk_score({
            'speech_rate': speech_rate,
            'pause_count': pause_count,
            'vocabulary_richness': vocabulary_richness,
            'fluency_score': fluency_score,
            'semantic_fluency': semantic_fluency,
            'syntactic_complexity': syntactic_complexity,
            'repetition_score': repetition_score,
            'word_finding_difficulty': word_finding_difficulty
        })
        
        # Generate explanation
        explanation = self._generate_explanation(risk_score, {
            'speech_rate': speech_rate,
            'pause_count': pause_count,
            'vocabulary_richness': vocabulary_richness,
            'fluency_score': fluency_score
        })
        
        return {
            'riskScore': int(risk_score),
            'explanation': explanation,
            'metrics': {
                'speechRate': speech_rate,
                'pauseCount': pause_count,
                'vocabularyRichness': vocabulary_richness,
                'fluencyScore': fluency_score
            }
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _tokenize_words(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Simple word tokenization
        words = re.findall(r'\b\w+\b', text)
        return [word for word in words if len(word) > 1]  # Filter very short words
    
    def _tokenize_sentences(self, text: str) -> List[str]:
        """Tokenize text into sentences"""
        try:
            sentences = nltk.sent_tokenize(text)
            return [s for s in sentences if len(s.strip()) > 0]
        except:
            # Fallback sentence splitting
            sentences = re.split(r'[.!?]+', text)
            return [s.strip() for s in sentences if s.strip()]
    
    def _calculate_speech_rate(self, words: List[str], metadata: Dict[str, Any]) -> float:
        """Calculate words per minute"""
        if not metadata or 'duration' not in metadata:
            # Estimate based on average speaking rate
            return max(60.0, min(200.0, len(words) * 2.0))  # Rough estimate
        
        duration = metadata.get('duration', 30.0)
        if duration <= 0:
            duration = 30.0
        
        words_per_minute = (len(words) / duration) * 60.0
        return round(words_per_minute, 1)
    
    def _estimate_pause_count(self, transcript: str) -> int:
        """Estimate number of pauses based on transcript patterns"""
        # Count explicit pause indicators
        pause_indicators = ['...', '..', 'um', 'uh', 'er', 'ah']
        pause_count = 0
        
        for indicator in pause_indicators:
            pause_count += transcript.lower().count(indicator)
        
        # Add pauses based on punctuation
        pause_count += transcript.count(',')
        pause_count += transcript.count(';') * 2
        
        return min(pause_count, 20)  # Cap at reasonable maximum
    
    def _calculate_vocabulary_richness(self, words: List[str]) -> float:
        """Calculate vocabulary diversity (Type-Token Ratio)"""
        if not words:
            return 0.0
        
        unique_words = set(words)
        ttr = len(unique_words) / len(words)
        return round(ttr, 3)
    
    def _calculate_fluency_score(self, transcript: str, words: List[str]) -> float:
        """Calculate overall fluency score (0-10)"""
        score = 10.0  # Start with perfect score
        
        # Penalize for filler words
        filler_count = sum(1 for word in words if word in self.filler_words)
        filler_ratio = filler_count / max(len(words), 1)
        score -= filler_ratio * 30  # Heavy penalty for fillers
        
        # Penalize for repetitions
        repetition_penalty = self._analyze_repetitions(words)
        score -= repetition_penalty * 2
        
        # Penalize for word-finding difficulties
        word_finding_penalty = self._analyze_word_finding(transcript, words)
        score -= word_finding_penalty * 3
        
        return max(0.0, min(10.0, round(score, 1)))
    
    def _analyze_semantic_fluency(self, words: List[str]) -> float:
        """Analyze semantic category fluency"""
        category_words = set()
        for category, word_set in self.semantic_categories.items():
            category_words.update(word for word in words if word in word_set)
        
        # Higher diversity = better semantic fluency
        return len(category_words) / max(len(words), 1)
    
    def _analyze_syntactic_complexity(self, sentences: List[str]) -> float:
        """Analyze syntactic complexity"""
        if not sentences:
            return 0.0
        
        total_complexity = 0
        for sentence in sentences:
            words_in_sentence = len(sentence.split())
            # Longer sentences generally indicate better syntactic complexity
            complexity = min(words_in_sentence / 15.0, 1.0)  # Normalize to 0-1
            total_complexity += complexity
        
        return total_complexity / len(sentences)
    
    def _analyze_repetitions(self, words: List[str]) -> float:
        """Analyze word repetitions (higher = more concerning)"""
        if not words:
            return 0.0
        
        word_counts = Counter(words)
        # Look for excessive repetition of common words
        repetitions = sum(count - 1 for count in word_counts.values() if count > 2)
        return repetitions / max(len(words), 1)
    
    def _analyze_word_finding(self, transcript: str, words: List[str]) -> float:
        """Analyze word-finding difficulties"""
        difficulty_score = 0.0
        
        # Count word-finding indicators
        for indicator in self.word_finding_indicators:
            difficulty_score += transcript.lower().count(indicator)
        
        # Look for incomplete sentences or trailing off
        difficulty_score += transcript.count('...')
        
        return min(difficulty_score / max(len(words), 1), 1.0)
    
    def _calculate_risk_score(self, metrics: Dict[str, float]) -> float:
        """Calculate overall dementia risk score (0-100)"""
        risk_score = 0.0
        
        # Speech rate analysis (optimal: 120-180 WPM)
        speech_rate = metrics['speech_rate']
        if speech_rate < 80:
            risk_score += 25  # Very slow speech
        elif speech_rate < 100:
            risk_score += 15  # Slow speech
        elif speech_rate > 200:
            risk_score += 10  # Unusually fast (could indicate anxiety)
        
        # Pause count analysis (concerning if > 10)
        pause_count = metrics['pause_count']
        if pause_count > 15:
            risk_score += 20
        elif pause_count > 10:
            risk_score += 10
        elif pause_count > 5:
            risk_score += 5
        
        # Vocabulary richness (concerning if < 0.4)
        vocab_richness = metrics['vocabulary_richness']
        if vocab_richness < 0.3:
            risk_score += 25
        elif vocab_richness < 0.4:
            risk_score += 15
        elif vocab_richness < 0.5:
            risk_score += 5
        
        # Fluency score (concerning if < 5)
        fluency = metrics['fluency_score']
        if fluency < 3:
            risk_score += 25
        elif fluency < 5:
            risk_score += 15
        elif fluency < 7:
            risk_score += 5
        
        # Additional metrics
        if 'word_finding_difficulty' in metrics:
            risk_score += metrics['word_finding_difficulty'] * 20
        
        if 'repetition_score' in metrics:
            risk_score += metrics['repetition_score'] * 15
        
        return min(100.0, max(0.0, round(risk_score, 0)))
    
    def _generate_explanation(self, risk_score: float, metrics: Dict[str, float]) -> str:
        """Generate human-readable explanation of the analysis"""
        explanations = []
        
        # Overall risk assessment
        if risk_score < 30:
            explanations.append("Speech patterns appear normal with good fluency and vocabulary use.")
        elif risk_score < 70:
            explanations.append("Some speech patterns may warrant attention, showing mild concerns in certain areas.")
        else:
            explanations.append("Several speech patterns suggest potential cognitive changes that may benefit from professional evaluation.")
        
        # Specific metric explanations
        speech_rate = metrics['speech_rate']
        if speech_rate < 80:
            explanations.append(f"Speech rate is notably slow at {speech_rate:.1f} words/minute (typical range: 120-180).")
        elif speech_rate > 200:
            explanations.append(f"Speech rate is quite fast at {speech_rate:.1f} words/minute, which may indicate anxiety or other factors.")
        
        pause_count = metrics['pause_count']
        if pause_count > 10:
            explanations.append(f"Frequent pauses detected ({pause_count} instances), which may indicate word-finding difficulties.")
        
        vocab_richness = metrics['vocabulary_richness']
        if vocab_richness < 0.4:
            explanations.append(f"Vocabulary diversity is lower than expected ({vocab_richness*100:.0f}% unique words).")
        
        fluency = metrics['fluency_score']
        if fluency < 5:
            explanations.append(f"Fluency score is concerning ({fluency:.1f}/10), with evidence of hesitations or word-finding issues.")
        
        if not explanations:
            explanations.append("All speech metrics appear within normal ranges for this sample.")
        
        return " ".join(explanations)