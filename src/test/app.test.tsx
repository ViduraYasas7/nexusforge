import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';

describe('NexusForge - Full Automated Comprehensive Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    // Default mock: Backend returns 503 so frontend uses local fallback
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/api/admin/verify')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        });
      }
      return Promise.resolve({
        ok: false,
        status: 503,
        json: async () => ({ error: 'MongoDB offline', offline: true })
      });
    });

    // Mock HTMLAnchorElement click for download tests
    HTMLAnchorElement.prototype.click = vi.fn();
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. INITIAL RENDERING & OLED THEME
  // ==========================================
  describe('1. Initial UI & Minimalist Theme', () => {
    it('renders the branding and OLED dark structure', async () => {
      let container: HTMLElement;
      await act(async () => {
        const res = render(<App />);
        container = res.container;
      });

      expect(screen.getByText('NexusForge')).toBeInTheDocument();
      expect(screen.getByText('OS')).toBeInTheDocument();

      const rootDiv = container!.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('bg-black');
    });

    it('renders default projects in the sidebar', async () => {
      await act(async () => {
        render(<App />);
      });

      expect(screen.getAllByText(/NexusForge — Full-Stack Project/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Real-Time Chat Application').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('StoryHub Publishing Platform').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('GasMate Delivery Tracker').length).toBeGreaterThanOrEqual(1);
    });

    it('displays the three public navigation tabs and hides Admin tab', async () => {
      await act(async () => {
        render(<App />);
      });

      expect(screen.getByRole('button', { name: /1\. Tasks & Features/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2\. Copy for LinkedIn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /3\. Project Overview & Links/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /4\. Admin Dashboard/i })).not.toBeInTheDocument();
    });

    it('shows the storage status indicator in the sidebar', async () => {
      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getAllByText(/Storage: Local Mode/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ==========================================
  // 2. PUBLIC MODE & SECURITY LOCK
  // ==========================================
  describe('2. Public Mode & Security Lock', () => {
    it('locks modification controls by default for LinkedIn visitors', async () => {
      await act(async () => {
        render(<App />);
      });

      expect(screen.getAllByText(/Public View \(Locked\)/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Viewing in Public Mode\. Editing controls are locked\./i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Add New Project/i })).not.toBeInTheDocument();
      expect(screen.getAllByText(/Public Read-Only/i).length).toBeGreaterThanOrEqual(1);
    });

    it('shows error on wrong PIN in unlock modal', async () => {
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/admin/verify')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: false })
          });
        }
        return Promise.resolve({ ok: false, status: 503, json: async () => ({}) });
      });

      await act(async () => {
        render(<App />);
      });

      const unlockButtons = screen.getAllByText(/Public View \(Locked\)/i);
      await act(async () => {
        fireEvent.click(unlockButtons[0].closest('button')!);
      });

      expect(screen.getByText('Unlock Admin Mode')).toBeInTheDocument();
      const pinInput = screen.getByPlaceholderText(/Default: 1234/i);

      await act(async () => {
        fireEvent.change(pinInput, { target: { value: '9999' } });
        fireEvent.click(screen.getByRole('button', { name: /^Unlock$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/Incorrect PIN\. Please try again\./i)).toBeInTheDocument();
      });
    });

    it('successfully unlocks with default PIN 1234', async () => {
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/admin/verify')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true })
          });
        }
        return Promise.resolve({ ok: false, status: 503, json: async () => ({}) });
      });

      await act(async () => {
        render(<App />);
      });

      const unlockButtons = screen.getAllByText(/Public View \(Locked\)/i);
      await act(async () => {
        fireEvent.click(unlockButtons[0].closest('button')!);
      });

      const pinInput = screen.getByPlaceholderText(/Default: 1234/i);

      await act(async () => {
        fireEvent.change(pinInput, { target: { value: '1234' } });
        fireEvent.click(screen.getByRole('button', { name: /^Unlock$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/Admin Mode: ON/i)).toBeInTheDocument();
      });

      // Admin Dashboard tab appears
      expect(screen.getByRole('button', { name: /4\. Admin Dashboard/i })).toBeInTheDocument();
      // Add New Project button appears
      expect(screen.getByRole('button', { name: /Add New Project/i })).toBeInTheDocument();
    });
  });

  // ==========================================
  // 3. TASK MANAGEMENT (CRUD & VIEWS)
  // ==========================================
  describe('3. Task Management (CRUD & Views)', () => {
    beforeEach(() => {
      localStorage.setItem('nexusforge_is_admin', 'true');
    });

    it('adds a new task through the quick-add bar', async () => {
      await act(async () => {
        render(<App />);
      });

      const titleInput = screen.getByPlaceholderText(/What did you build\?/i);
      const resultInput = screen.getByPlaceholderText(/Result \/ Benefit/i);
      const submitBtn = screen.getByRole('button', { name: /Add Task/i });

      await act(async () => {
        fireEvent.change(titleInput, { target: { value: 'High Performance Cache' } });
        fireEvent.change(resultInput, { target: { value: '99.9% cache hit ratio' } });
        fireEvent.click(submitBtn);
      });

      await waitFor(() => {
        expect(screen.getAllByText('High Performance Cache').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/99\.9% cache hit ratio/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('switches between Board view and List view', async () => {
      await act(async () => {
        render(<App />);
      });

      // Switch to List view
      const listBtn = screen.getByRole('button', { name: /Simple List View/i });
      await act(async () => {
        fireEvent.click(listBtn);
      });

      // In list view, results are prefixed with Result:
      expect(screen.getAllByText(/Result:/i).length).toBeGreaterThanOrEqual(1);

      // Switch back to Board view
      const boardBtn = screen.getByRole('button', { name: /Board View/i });
      await act(async () => {
        fireEvent.click(boardBtn);
      });

      expect(screen.getAllByText(/TO DO/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/IN PROGRESS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('filters tasks using the search box', async () => {
      await act(async () => {
        render(<App />);
      });

      const searchInput = screen.getByPlaceholderText(/Search tasks\.\.\./i);
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Admin Dashboard' } });
      });

      expect(screen.getByText(/Implemented Monochrome Admin Dashboard/i)).toBeInTheDocument();
      expect(screen.queryByText(/Created 1-click LinkedIn Feed/i)).not.toBeInTheDocument();
    });

    it('opens and updates task via edit modal in list view', async () => {
      await act(async () => {
        render(<App />);
      });

      // Switch to list view
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Simple List View/i }));
      });

      const editButtons = screen.getAllByTitle('Edit Task');
      await act(async () => {
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByText('Edit Task / Feature')).toBeInTheDocument();

      // Find the title input by its current value
      const titleInput = screen.getByDisplayValue(/Built full-stack project & task tracker/i);
      await act(async () => {
        fireEvent.change(titleInput, { target: { value: 'Updated Full-Stack Engine' } });
        fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
      });

      await waitFor(() => {
        expect(screen.getAllByText('Updated Full-Stack Engine').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ==========================================
  // 4. PROJECT MANAGEMENT (CRUD)
  // ==========================================
  describe('4. Project Management', () => {
    beforeEach(() => {
      localStorage.setItem('nexusforge_is_admin', 'true');
    });

    it('switches between projects when clicked in sidebar', async () => {
      await act(async () => {
        render(<App />);
      });

      const storyHubNodes = screen.getAllByText('StoryHub Publishing Platform');
      await act(async () => {
        fireEvent.click(storyHubNodes[0].closest('button')!);
      });

      await waitFor(() => {
        expect(screen.getAllByText('StoryHub Publishing Platform').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/An interactive storytelling and blogging platform/i)).toBeInTheDocument();
      });
    });

    it('creates a new project via the modal', async () => {
      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add New Project/i }));
      });

      expect(screen.getByText('Add New Portfolio Project')).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText(/e\.g\., Real-Time Chat App/i);
      const summaryInput = screen.getByPlaceholderText(/What is this project\?/i);

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'QuantumCloud Storage' } });
        fireEvent.change(summaryInput, { target: { value: 'Decentralized distributed cloud file system' } });
        fireEvent.click(screen.getByRole('button', { name: /Save Project/i }));
      });

      await waitFor(() => {
        expect(screen.getAllByText('QuantumCloud Storage').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('prevents deleting the only project left', async () => {
      localStorage.setItem('nexusforge_simple_projects', JSON.stringify([
        {
          id: 'single-proj',
          name: 'Only Project',
          summary: 'Single',
          techStack: ['React'],
          status: 'In Progress'
        }
      ]));

      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /4\. Admin Dashboard/i }));
      });

      const deleteBtn = screen.getByTitle('Delete Project');
      await act(async () => {
        fireEvent.click(deleteBtn);
      });

      expect(screen.getAllByText('Only Project').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 5. LINKEDIN COPY GENERATOR
  // ==========================================
  describe('5. LinkedIn Copy Generator', () => {
    it('generates LinkedIn post and allows format switching', async () => {
      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /2\. Copy for LinkedIn/i }));
      });

      expect(screen.getByText(/1\. LinkedIn Feed Post/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Profile/i)).toBeInTheDocument();

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toContain('Excited to share my project: NexusForge — Full-Stack Project & LinkedIn Studio');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /2\. Profile/i }));
      });

      expect(textarea.value).toContain('Key Features Built:');
      expect(textarea.value).toContain('Technologies Used:');
    });

    it('copies generated text to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock }
      });

      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /2\. Copy for LinkedIn/i }));
      });

      const copyBtn = screen.getByRole('button', { name: /Copy Text for LinkedIn/i });
      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 6. PROJECT OVERVIEW & ARCHITECTURE
  // ==========================================
  describe('6. Project Overview & Architecture Tab', () => {
    it('displays architecture and repository links', async () => {
      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /3\. Project Overview & Links/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/1\. Frontend \/ User Interface/i)).toBeInTheDocument();
        expect(screen.getByText(/2\. Backend \/ API Logic/i)).toBeInTheDocument();
        expect(screen.getByText(/3\. Database & Storage/i)).toBeInTheDocument();
        expect(screen.getByText(/View GitHub Repo/i)).toBeInTheDocument();
        expect(screen.getByText(/Open Live App/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // 7. ADMIN DASHBOARD & CONTROLS
  // ==========================================
  describe('7. Admin Dashboard & Controls', () => {
    beforeEach(() => {
      localStorage.setItem('nexusforge_is_admin', 'true');
    });

    it('renders 4 monochrome stat cards and management table', async () => {
      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /4\. Admin Dashboard/i }));
      });

      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Completed Projects')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('Manage All Projects')).toBeInTheDocument();
      expect(screen.getByText('Admin Controls & Data Operations')).toBeInTheDocument();
    });

    it('updates Admin PIN via modal', async () => {
      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /4\. Admin Dashboard/i }));
      });

      await act(async () => {
        fireEvent.click(screen.getByText(/Update Admin PIN/i));
      });

      expect(screen.getByText('Change Admin PIN')).toBeInTheDocument();
      const newPinInput = screen.getByPlaceholderText(/Enter new 4-digit PIN/i);

      await act(async () => {
        fireEvent.change(newPinInput, { target: { value: '5678' } });
        fireEvent.click(screen.getByRole('button', { name: /Save PIN/i }));
      });

      expect(localStorage.getItem('nexusforge_admin_pin')).toBe('5678');
    });

    it('exports backup snapshot file', async () => {
      await act(async () => {
        render(<App />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /4\. Admin Dashboard/i }));
      });

      await act(async () => {
        fireEvent.click(screen.getByText(/Export JSON Backup/i));
      });

      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    });

    it('locks back to Public View when Lock button is clicked', async () => {
      await act(async () => {
        render(<App />);
      });

      expect(screen.getByText(/Admin Mode: ON/i)).toBeInTheDocument();

      const lockBtn = screen.getByText(/Admin Mode: ON/i).closest('button');
      await act(async () => {
        fireEvent.click(lockBtn!);
      });

      expect(screen.getAllByText(/Public View \(Locked\)/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByRole('button', { name: /4\. Admin Dashboard/i })).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // 8. BACKEND & MONGODB CONNECTIVITY
  // ==========================================
  describe('8. Backend & MongoDB Connectivity', () => {
    it('sets status to MongoDB: Connected when backend responds with 200', async () => {
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/api/projects')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 'remote-1',
                name: 'Remote Connected App',
                summary: 'Fetched from MongoDB',
                problemSolved: 'Solves real-time DB sync',
                keyResult: 'Instant sync',
                status: 'Completed',
                techStack: ['Node.js', 'MongoDB'],
                howItWorks: { frontend: 'React', backend: 'Express', database: 'MongoDB' },
                githubUrl: '',
                liveUrl: '',
                role: 'Engineer'
              }
            ]
          });
        }
        if (typeof url === 'string' && url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              {
                id: 'remote-task-1',
                projectId: 'remote-1',
                title: 'Remote Task In DB',
                result: 'Persisted to DB',
                status: 'Done',
                priority: 'High',
                category: 'Database'
              }
            ]
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getAllByText('Remote Connected App').length).toBeGreaterThanOrEqual(1);
        const indicators = screen.getAllByText(/MongoDB: Connected/i);
        expect(indicators.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  // ==========================================
  // 9. MICROSOFT PLANNER & AI NOVELTY FEATURES
  // ==========================================
  describe('9. Microsoft Planner Views, Group-By & AI Subtask Copilot', () => {
    beforeEach(() => {
      localStorage.setItem('nexusforge_is_admin', 'true');
    });

    it('pivots board columns dynamically using Microsoft Planner Group By selector', async () => {
      await act(async () => {
        render(<App />);
      });

      const groupBySelect = screen.getByLabelText(/Group By/i);
      await act(async () => {
        fireEvent.change(groupBySelect, { target: { value: 'Bucket' } });
      });

      expect(screen.getAllByText(/BACKLOG & IDEAS/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/CURRENT SPRINT/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/SHIPPED & LIVE/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders Schedule Timeline and Charts & AI Radar views', async () => {
      await act(async () => {
        render(<App />);
      });

      // Open Schedule View
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /^Schedule$/i }));
      });
      expect(screen.getByText(/Schedule & Sprint Timeline/i)).toBeInTheDocument();

      // Open Charts & AI Radar View
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Charts & AI Radar/i }));
      });
      expect(screen.getByText(/AI Sprint Copilot & Bottleneck Radar/i)).toBeInTheDocument();
      expect(screen.getByText(/Status Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Tasks by Bucket/i)).toBeInTheDocument();
    });

    it('switches between Fluent Dark and Light themes and filters My Day tasks', async () => {
      let container: HTMLElement;
      await act(async () => {
        const res = render(<App />);
        container = res.container;
      });

      const rootDiv = container!.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('bg-black');

      const themeBtn = screen.getByTitle(/Switch Fluent Dark \/ Light Theme/i);
      await act(async () => {
        fireEvent.click(themeBtn);
      });

      // Verify Light / Color Mode class is applied immediately
      expect(rootDiv).toHaveClass('bg-slate-50');
      expect(localStorage.getItem('nexusforge_theme_mode')).toBe('light');

      const myDayBtn = screen.getByRole('button', { name: /My Day Focus/i });
      await act(async () => {
        fireEvent.click(myDayBtn);
      });

      expect(screen.getAllByText(/Built full-stack project & task tracker/i).length).toBeGreaterThanOrEqual(1);
    });

    it('opens Universal Share & Copy Plan Link modal with URL and multi-platform options', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock }
      });

      await act(async () => {
        render(<App />);
      });

      const shareBtn = screen.getByRole('button', { name: /^Share$/i });
      await act(async () => {
        fireEvent.click(shareBtn);
      });

      expect(screen.getByText(/Share Plan & Copy Link/i)).toBeInTheDocument();
      const urlInput = screen.getByLabelText(/Shareable Plan URL/i) as HTMLInputElement;
      expect(urlInput.value).toContain('?plan=');

      // Multi-platform share links exist
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Telegram')).toBeInTheDocument();
      expect(screen.getByText('X / Twitter')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();

      // Copy URL button copies the plan link
      const copyUrlBtn = screen.getByRole('button', { name: /Copy URL/i });
      await act(async () => {
        fireEvent.click(copyUrlBtn);
      });

      expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('?plan='));
    });

    it('opens the Stress-Relief Break Arcade with Shooting Game and Car Racing Game', async () => {
      await act(async () => {
        render(<App />);
      });

      const arcadeBtn = screen.getByRole('button', { name: /Stress Relief Games/i });
      await act(async () => {
        fireEvent.click(arcadeBtn);
      });

      expect(screen.getByText(/Developer Stress-Relief Break Arcade/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Cyber Bug Blaster/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Nitro Sprint Racer/i).length).toBeGreaterThanOrEqual(1);

      // Switch to Car Racing Game
      const racerTab = screen.getByRole('button', { name: /2\. Nitro Sprint Racer/i });
      await act(async () => {
        fireEvent.click(racerTab);
      });

      expect(screen.getByText(/Start Nitro Sprint Racer/i)).toBeInTheDocument();
    });
  });
});
