import { createContext, useContext, useReducer, useEffect, useState, useRef, type ReactNode } from 'react';
import type { AppState, Subject, Topic, Revision, MockTest, PYQEntry, DSAProblem, StudySession } from '@/types';
import { loadState, saveState } from '@/utils/storage';
import { generateId, generateRevisions, updateRevisionStatuses, calculateStreak } from '@/utils/helpers';
import { format } from 'date-fns';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { defaultState } from '@/data/defaults';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_TOPIC'; payload: { subjectId: string; topic: Omit<Topic, 'id' | 'subjectId'> } }
  | { type: 'UPDATE_TOPIC'; payload: { subjectId: string; topic: Topic } }
  | { type: 'DELETE_TOPIC'; payload: { subjectId: string; topicId: string } }
  | { type: 'COMPLETE_TOPIC'; payload: { subjectId: string; topicId: string } }
  | { type: 'COMPLETE_REVISION'; payload: { revisionId: string } }
  | { type: 'ADD_MOCK_TEST'; payload: Omit<MockTest, 'id'> }
  | { type: 'DELETE_MOCK_TEST'; payload: string }
  | { type: 'ADD_PYQ'; payload: Omit<PYQEntry, 'id'> }
  | { type: 'UPDATE_PYQ'; payload: PYQEntry }
  | { type: 'ADD_DSA_PROBLEM'; payload: Omit<DSAProblem, 'id'> }
  | { type: 'ADD_STUDY_SESSION'; payload: Omit<StudySession, 'id'> }
  | { type: 'UPDATE_SUBJECT'; payload: Partial<Subject> & { id: string } }
  | { type: 'UPDATE_DAILY_GOAL'; payload: AppState['dailyGoal'] }
  | { type: 'CHECK_MILESTONES' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_TOPIC': {
      const newTopic: Topic = {
        ...action.payload.topic,
        id: generateId(),
        subjectId: action.payload.subjectId,
      };
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? { ...s, topics: [...s.topics, newTopic] }
            : s
        ),
      };
    }

    case 'UPDATE_TOPIC': {
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topics: s.topics.map(t =>
                  t.id === action.payload.topic.id ? action.payload.topic : t
                ),
              }
            : s
        ),
      };
    }

    case 'DELETE_TOPIC': {
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? { ...s, topics: s.topics.filter(t => t.id !== action.payload.topicId) }
            : s
        ),
        revisions: state.revisions.filter(r => r.topicId !== action.payload.topicId),
      };
    }

    case 'COMPLETE_TOPIC': {
      const subject = state.subjects.find(s => s.id === action.payload.subjectId);
      const topic = subject?.topics.find(t => t.id === action.payload.topicId);
      if (!subject || !topic) return state;

      const completedTopic = {
        ...topic,
        dateCompleted: format(new Date(), 'yyyy-MM-dd'),
      };
      const newRevisions = generateRevisions(completedTopic, subject);

      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? {
                ...s,
                topics: s.topics.map(t =>
                  t.id === action.payload.topicId ? completedTopic : t
                ),
              }
            : s
        ),
        revisions: [...state.revisions, ...newRevisions],
      };
    }

    case 'COMPLETE_REVISION': {
      return {
        ...state,
        revisions: state.revisions.map(r =>
          r.id === action.payload.revisionId
            ? { ...r, completedDate: format(new Date(), 'yyyy-MM-dd'), status: 'completed' as const }
            : r
        ),
      };
    }

    case 'ADD_MOCK_TEST': {
      return {
        ...state,
        mockTests: [...state.mockTests, { ...action.payload, id: generateId() }],
      };
    }

    case 'DELETE_MOCK_TEST': {
      return {
        ...state,
        mockTests: state.mockTests.filter(m => m.id !== action.payload),
      };
    }

    case 'ADD_PYQ': {
      return {
        ...state,
        pyqEntries: [...state.pyqEntries, { ...action.payload, id: generateId() }],
      };
    }

    case 'UPDATE_PYQ': {
      return {
        ...state,
        pyqEntries: state.pyqEntries.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    }

    case 'ADD_DSA_PROBLEM': {
      return {
        ...state,
        dsaProblems: [...state.dsaProblems, { ...action.payload, id: generateId() }],
      };
    }

    case 'ADD_STUDY_SESSION': {
      const newSession: StudySession = { ...action.payload, id: generateId() };
      const newState = {
        ...state,
        studySessions: [...state.studySessions, newSession],
        subjects: state.subjects.map(s =>
          s.id === action.payload.subjectId
            ? { ...s, hoursStudied: s.hoursStudied + action.payload.hours }
            : s
        ),
        lastStudyDate: action.payload.date,
      };
      newState.streak = calculateStreak(newState);
      return newState;
    }

    case 'UPDATE_SUBJECT': {
      return {
        ...state,
        subjects: state.subjects.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    }

    case 'UPDATE_DAILY_GOAL': {
      return {
        ...state,
        dailyGoal: action.payload,
      };
    }

    case 'CHECK_MILESTONES': {
      const totalHours = state.studySessions.reduce((sum, s) => sum + s.hours, 0);
      return {
        ...state,
        milestones: state.milestones.map(m => {
          if (!m.achieved && totalHours >= m.targetHours) {
            return { ...m, achieved: true, achievedDate: format(new Date(), 'yyyy-MM-dd') };
          }
          return m;
        }),
      };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  syncing: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, null, () => defaultState());
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadRef = useRef(true);

  // Load state from Firestore on login
  useEffect(() => {
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      const localState = loadState();
      dispatch({ type: 'SET_STATE', payload: localState });
      setLoaded(true);
      isInitialLoadRef.current = false;
      return;
    }

    const loadFromFirestore = async () => {
      setSyncing(true);
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppState;
          const defaults = defaultState();
          const merged = {
            ...defaults,
            ...data,
            subjects: data.subjects || defaults.subjects,
            milestones: data.milestones || defaults.milestones,
          };
          dispatch({ type: 'SET_STATE', payload: merged });
        } else {
          // New user — check if there's local data to migrate
          const localState = loadState();
          const hasLocalData = localState.subjects.some(s => s.topics.length > 0) ||
            localState.studySessions.length > 0;
          if (hasLocalData) {
            dispatch({ type: 'SET_STATE', payload: localState });
            // Save local data to Firestore
            await setDoc(doc(db, 'users', user.uid), localState);
          } else {
            dispatch({ type: 'SET_STATE', payload: defaultState() });
          }
        }
      } catch (error) {
        console.error('Failed to load from Firestore:', error);
        dispatch({ type: 'SET_STATE', payload: loadState() });
      } finally {
        setSyncing(false);
        setLoaded(true);
        isInitialLoadRef.current = false;
      }
    };

    loadFromFirestore();
  }, [user]);

  // Debounced save to Firestore on state changes
  useEffect(() => {
    if (!loaded || isInitialLoadRef.current) return;

    // Always save to localStorage as backup
    saveState(state);

    if (!user) return;

    // Debounce Firestore saves
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), JSON.parse(JSON.stringify(state)));
      } catch (error) {
        console.error('Failed to save to Firestore:', error);
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state, user, loaded]);

  // Update revision statuses on load
  useEffect(() => {
    if (!loaded) return;
    const updated = updateRevisionStatuses(state.revisions);
    const hasChanges = updated.some((r, i) => r.status !== state.revisions[i]?.status);
    if (hasChanges) {
      dispatch({ type: 'SET_STATE', payload: { ...state, revisions: updated } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <AppContext.Provider value={{ state, dispatch, syncing }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
