// AI Learning Plan Application
class AILearningPlan {
    constructor() {
        this.completedDays = {};
        this.currentView = 'overview';
        this.elements = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.initializeElements();
        this.loadProgress();
        this.setupEventListeners();
        this.renderResourceLinks();
        this.showOverview();
        this.updateProgressStats();
    }
    
    initializeElements() {
        this.elements = {
            weekButtons: document.querySelectorAll('.week-btn'),
            overviewSection: document.getElementById('overview-section'),
            weekDetailSection: document.getElementById('week-detail-section'),
            weeksGrid: document.getElementById('weeks-grid'),
            daysGrid: document.getElementById('days-grid'),
            backBtn: document.getElementById('back-btn'),
            weekTitle: document.getElementById('week-title'),
            weekProgressText: document.getElementById('week-progress-text'),
            weekProgressFill: document.getElementById('week-progress-fill'),
            progressCircle: document.getElementById('progress-circle'),
            progressPercentage: document.getElementById('progress-percentage'),
            completedDaysCounter: document.getElementById('completed-days'),
            currentWeekCounter: document.getElementById('current-week'),
            resourceLinks: document.getElementById('resource-links'),
            downloadIcsBtn: document.getElementById('download-ics'),
            downloadMdBtn: document.getElementById('download-md')
        };
    }
    
    loadProgress() {
        // Don't use localStorage as per instructions
        this.completedDays = {};
    }
    
    saveProgress() {
        // Don't use localStorage as per instructions
        console.log('Progress would be saved:', this.completedDays);
    }
    
    setupEventListeners() {
        // Week navigation buttons
        this.elements.weekButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const week = btn.dataset.week;
                if (week === 'overview') {
                    this.showOverview();
                } else {
                    this.showWeekDetail(parseInt(week));
                }
            });
        });
        
        // Back button
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showOverview();
            });
        }
        
        // Download buttons
        if (this.elements.downloadIcsBtn) {
            this.elements.downloadIcsBtn.addEventListener('click', () => this.downloadICS());
        }
        if (this.elements.downloadMdBtn) {
            this.elements.downloadMdBtn.addEventListener('click', () => this.downloadMarkdown());
        }
    }
    
    showOverview() {
        this.currentView = 'overview';
        this.updateActiveWeekButton('overview');
        
        if (this.elements.overviewSection) {
            this.elements.overviewSection.classList.remove('hidden');
        }
        if (this.elements.weekDetailSection) {
            this.elements.weekDetailSection.classList.add('hidden');
        }
        
        this.renderOverview();
    }
    
    showWeekDetail(weekNumber) {
        const week = learningPlanData.weeks.find(w => w.week === weekNumber);
        if (!week) return;
        
        this.currentView = `week-${weekNumber}`;
        this.updateActiveWeekButton(weekNumber.toString());
        
        // Update week detail header
        if (this.elements.weekTitle) {
            this.elements.weekTitle.textContent = `Week ${week.week}: ${week.title}`;
        }
        
        // Update week progress
        this.updateWeekProgress(week);
        
        // Render days
        this.renderDays(week.days);
        
        // Show week detail section
        if (this.elements.overviewSection) {
            this.elements.overviewSection.classList.add('hidden');
        }
        if (this.elements.weekDetailSection) {
            this.elements.weekDetailSection.classList.remove('hidden');
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    renderOverview() {
        if (!this.elements.weeksGrid) return;
        
        this.elements.weeksGrid.innerHTML = '';
        
        learningPlanData.weeks.forEach(week => {
            const completedDaysCount = week.days.filter(day => this.completedDays[day.day]).length;
            const totalDays = week.days.length;
            const progressPercentage = Math.round((completedDaysCount / totalDays) * 100);
            
            const weekCard = document.createElement('div');
            weekCard.className = 'week-card';
            weekCard.setAttribute('data-week', week.week);
            
            weekCard.innerHTML = `
                <div class="week-number">Week ${week.week}</div>
                <h3 class="week-card-title">${week.title}</h3>
                <div class="week-card-progress">
                    <div class="week-card-progress-text">${completedDaysCount}/${totalDays} days completed</div>
                    <div class="week-card-progress-bar">
                        <div class="week-card-progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                <ul class="week-card-topics">
                    ${week.days.slice(0, 3).map(day => `<li>${day.title}</li>`).join('')}
                    ${week.days.length > 3 ? `<li>...and ${week.days.length - 3} more topics</li>` : ''}
                </ul>
            `;
            
            // Add click event listener
            weekCard.addEventListener('click', () => {
                this.showWeekDetail(week.week);
            });
            
            this.elements.weeksGrid.appendChild(weekCard);
        });
    }
    
    renderDays(days) {
        if (!this.elements.daysGrid) return;
        
        this.elements.daysGrid.innerHTML = '';
        
        days.forEach(day => {
            const isCompleted = !!this.completedDays[day.day];
            
            const dayCard = document.createElement('div');
            dayCard.className = `day-card ${isCompleted ? 'completed' : ''}`;
            
            dayCard.innerHTML = `
                <div class="day-header">
                    <div class="day-checkbox ${isCompleted ? 'checked' : ''}" 
                         data-day="${day.day}" 
                         role="button" 
                         tabindex="0"
                         aria-label="Mark day ${day.day} as ${isCompleted ? 'incomplete' : 'complete'}"></div>
                    <div class="day-number">Day ${day.day}</div>
                </div>
                <h4 class="day-title">${day.title}</h4>
                <ul class="day-topics">
                    ${day.topics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
                <div class="day-sources">
                    <div class="day-sources-title">Resources:</div>
                    <ul class="day-sources-list">
                        ${day.sources.map(source => `<li>${source}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            // Add checkbox event listener
            const checkbox = dayCard.querySelector('.day-checkbox');
            if (checkbox) {
                checkbox.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDayCompletion(day.day, dayCard, checkbox);
                });
                
                // Keyboard accessibility
                checkbox.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDayCompletion(day.day, dayCard, checkbox);
                    }
                });
            }
            
            this.elements.daysGrid.appendChild(dayCard);
        });
    }
    
    toggleDayCompletion(dayNumber, dayCard, checkbox) {
        const wasCompleted = !!this.completedDays[dayNumber];
        this.completedDays[dayNumber] = !wasCompleted;
        
        // Save progress
        this.saveProgress();
        
        // Update checkbox visual state
        if (this.completedDays[dayNumber]) {
            checkbox.classList.add('checked');
            dayCard.classList.add('completed');
            checkbox.setAttribute('aria-label', `Mark day ${dayNumber} as incomplete`);
        } else {
            checkbox.classList.remove('checked');
            dayCard.classList.remove('completed');
            checkbox.setAttribute('aria-label', `Mark day ${dayNumber} as complete`);
        }
        
        // Update all progress displays
        this.updateProgressStats();
        
        // Update week progress if in week detail view
        if (this.currentView.startsWith('week-')) {
            const weekNumber = parseInt(this.currentView.split('-')[1]);
            const week = learningPlanData.weeks.find(w => w.week === weekNumber);
            if (week) {
                this.updateWeekProgress(week);
            }
        }
        
        // Re-render overview if currently visible
        if (this.currentView === 'overview') {
            this.renderOverview();
        }
    }
    
    updateWeekProgress(week) {
        const completedDaysCount = week.days.filter(day => this.completedDays[day.day]).length;
        const totalDays = week.days.length;
        const progressPercentage = Math.round((completedDaysCount / totalDays) * 100);
        
        if (this.elements.weekProgressText) {
            this.elements.weekProgressText.textContent = `${completedDaysCount}/${totalDays} days completed`;
        }
        if (this.elements.weekProgressFill) {
            this.elements.weekProgressFill.style.width = `${progressPercentage}%`;
        }
    }
    
    updateProgressStats() {
        const totalDays = 48;
        const completedCount = Object.keys(this.completedDays).filter(day => this.completedDays[day]).length;
        const progressPerc = Math.round((completedCount / totalDays) * 100);
        
        // Update progress circle
        if (this.elements.progressCircle && this.elements.progressPercentage) {
            const circumference = 2 * Math.PI * 50;
            const strokeDashoffset = circumference - (progressPerc / 100) * circumference;
            this.elements.progressCircle.style.strokeDashoffset = strokeDashoffset;
            this.elements.progressPercentage.textContent = `${progressPerc}%`;
        }
        
        // Update footer stats
        if (this.elements.completedDaysCounter) {
            this.elements.completedDaysCounter.textContent = completedCount;
        }
        
        // Calculate current week
        let currentWeek = 1;
        for (let i = 0; i < learningPlanData.weeks.length; i++) {
            const week = learningPlanData.weeks[i];
            const weekCompletedCount = week.days.filter(day => this.completedDays[day.day]).length;
            if (weekCompletedCount < week.days.length) {
                currentWeek = week.week;
                break;
            }
            if (i === learningPlanData.weeks.length - 1) {
                currentWeek = 8;
            }
        }
        
        if (this.elements.currentWeekCounter) {
            this.elements.currentWeekCounter.textContent = currentWeek;
        }
    }
    
    updateActiveWeekButton(activeWeek) {
        this.elements.weekButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.week === activeWeek) {
                btn.classList.add('active');
            }
        });
    }
    
    renderResourceLinks() {
        if (!this.elements.resourceLinks) return;
        
        this.elements.resourceLinks.innerHTML = '';
        
        learningPlanData.resources.forEach(resource => {
            const [title, url] = resource.split(' – ');
            const li = document.createElement('li');
            li.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
            this.elements.resourceLinks.appendChild(li);
        });
    }
    
    downloadICS() {
        const icsContent = this.generateICSContent();
        this.downloadFile(icsContent, 'ai-learning-plan.ics', 'text/calendar');
    }
    
    downloadMarkdown() {
        const mdContent = this.generateMarkdownContent();
        this.downloadFile(mdContent, 'ai-learning-plan.md', 'text/markdown');
    }
    
    generateICSContent() {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AI Learning Plan//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];
        
        const startDate = new Date('2025-01-20');
        
        learningPlanData.weeks.forEach(week => {
            week.days.forEach((day) => {
                const dayDate = new Date(startDate);
                dayDate.setDate(startDate.getDate() + (day.day - 1));
                
                const dateStr = dayDate.toISOString().replace(/[-:]/g, '').split('T')[0];
                
                icsContent.push('BEGIN:VEVENT');
                icsContent.push(`UID:day-${day.day}@ai-learning-plan.com`);
                icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
                icsContent.push(`DTEND;VALUE=DATE:${dateStr}`);
                icsContent.push(`SUMMARY:Day ${day.day}: ${day.title}`);
                icsContent.push(`DESCRIPTION:${day.topics.join(', ')}`);
                icsContent.push('END:VEVENT');
            });
        });
        
        icsContent.push('END:VCALENDAR');
        return icsContent.join('\r\n');
    }
    
    generateMarkdownContent() {
        let mdContent = [
            '# 8-Week AI Basics Learning Plan',
            '',
            'Master Artificial Intelligence Fundamentals in 2 Months',
            '',
            '## Overview',
            '',
            '- **Duration:** 8 weeks',
            '- **Study Days:** 48 days',
            '- **Schedule:** 6 days per week',
            '',
            '---',
            ''
        ];
        
        learningPlanData.weeks.forEach(week => {
            mdContent.push(`## Week ${week.week}: ${week.title}`, '');
            
            week.days.forEach(day => {
                mdContent.push(`### Day ${day.day}: ${day.title}`, '');
                mdContent.push('**Topics:**');
                day.topics.forEach(topic => {
                    mdContent.push(`- ${topic}`);
                });
                mdContent.push('');
                mdContent.push('**Resources:**');
                day.sources.forEach(source => {
                    mdContent.push(`- ${source}`);
                });
                mdContent.push('');
            });
            
            mdContent.push('---', '');
        });
        
        mdContent.push('## Learning Resources', '');
        learningPlanData.resources.forEach(resource => {
            mdContent.push(`- ${resource}`);
        });
        
        return mdContent.join('\n');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Learning plan data
const learningPlanData = {
    weeks: [
        {
            week: 1,
            title: "Foundations & Problem-Solving Agents",
            days: [
                {
                    day: 1,
                    title: "What is AI? History & Scope",
                    topics: ["What is AI? History & scope", "Read syllabus & agent design space"],
                    sources: ["Elements of AI (Intro)", "Russell & Norvig 4e Chap 1"]
                },
                {
                    day: 2,
                    title: "Intelligent Agents & PEAS Framework",
                    topics: ["Intelligent agents, PEAS framework", "Rationality vs. heuristics"],
                    sources: ["Microsoft AI for Beginners Lesson 1", "AIMA Chap 2"]
                },
                {
                    day: 3,
                    title: "Uninformed Search (BFS, DFS)",
                    topics: ["Uninformed search: BFS, DFS", "Hand-trace on 8-puzzle"],
                    sources: ["AIMA Chap 3", "CS50 AI Week 0 video"]
                },
                {
                    day: 4,
                    title: "Informed Search (Greedy, A*)",
                    topics: ["Informed search: Greedy, A*", "Heuristic design (Manhattan)"],
                    sources: ["AIMA Chap 3.5-3.6", "UC Berkeley CS188 Lecture 2"]
                },
                {
                    day: 5,
                    title: "Adversarial Search & Minimax",
                    topics: ["Adversarial search & Minimax", "Alpha-Beta pruning demo"],
                    sources: ["AIMA Chap 5", "freeCodeCamp Alpha-Beta video"]
                },
                {
                    day: 6,
                    title: "Constraint Satisfaction Problems",
                    topics: ["Constraint Satisfaction Problems intro", "Sudoku as CSP"],
                    sources: ["AIMA Chap 6", "AI for Beginners Lesson 6"]
                }
            ]
        },
        {
            week: 2,
            title: "Classical Reasoning & Uncertainty",
            days: [
                {
                    day: 7,
                    title: "Propositional Logic",
                    topics: ["Propositional logic syntax/semantics", "Truth tables"],
                    sources: ["AIMA Chap 7", "NPTEL AI Week 4"]
                },
                {
                    day: 8,
                    title: "Inference by Resolution",
                    topics: ["Inference by resolution", "Horn clauses"],
                    sources: ["AIMA Chap 7", "CS229 Logic notes"]
                },
                {
                    day: 9,
                    title: "First-Order Logic Basics",
                    topics: ["FOL basics", "Quantifiers, predicates"],
                    sources: ["AIMA Chap 8"]
                },
                {
                    day: 10,
                    title: "FOL Inference",
                    topics: ["Unification", "Forward/backward chaining"],
                    sources: ["AIMA Chap 9"]
                },
                {
                    day: 11,
                    title: "Probabilistic Reasoning",
                    topics: ["Bayes rule", "Conditional independence"],
                    sources: ["AIMA Chap 12", "Khan Academy"]
                },
                {
                    day: 12,
                    title: "Bayesian Networks",
                    topics: ["BN structure & inference", "pgmpy demo"],
                    sources: ["AIMA Chap 13", "AI for Beginners Lesson 10"]
                }
            ]
        },
        {
            week: 3,
            title: "Machine Learning Core Ideas",
            days: [
                {
                    day: 13,
                    title: "ML Taxonomy & Splits",
                    topics: ["Supervised vs unsupervised vs RL", "Train/valid/test splits"],
                    sources: ["Andrew Ng ML Specialization"]
                },
                {
                    day: 14,
                    title: "Linear Regression",
                    topics: ["Linear regression intuition & loss", "scikit-learn"],
                    sources: ["Andrew Ng ML Spec"]
                },
                {
                    day: 15,
                    title: "Classification & Logistic Regression",
                    topics: ["Logistic regression", "Confusion matrix"],
                    sources: ["Andrew Ng ML Spec"]
                },
                {
                    day: 16,
                    title: "Decision Trees",
                    topics: ["Decision trees & overfitting", "Visualize depth"],
                    sources: ["AI for Beginners"]
                },
                {
                    day: 17,
                    title: "k-Nearest Neighbors",
                    topics: ["kNN & bias-variance", "Distance metrics"],
                    sources: ["CS229 notes"]
                },
                {
                    day: 18,
                    title: "k-Means Clustering",
                    topics: ["k-Means & silhouette score"],
                    sources: ["fast.ai ML"]
                }
            ]
        },
        {
            week: 4,
            title: "Model Evaluation & Feature Engineering",
            days: [
                {
                    day: 19,
                    title: "Cross-Validation",
                    topics: ["K-fold", "Learning curves"],
                    sources: ["Coursera Duke ML"]
                },
                {
                    day: 20,
                    title: "Feature Engineering",
                    topics: ["Scaling", "Pipelines"],
                    sources: ["scikit-learn docs"]
                },
                {
                    day: 21,
                    title: "Regularization",
                    topics: ["L1/L2", "Ridge vs Lasso"],
                    sources: ["Andrew Ng ML Spec"]
                },
                {
                    day: 22,
                    title: "Ensemble Methods",
                    topics: ["Bagging", "Random Forests"],
                    sources: ["fast.ai ML"]
                },
                {
                    day: 23,
                    title: "Gradient Boosting",
                    topics: ["XGBoost", "Boosting basics"],
                    sources: ["Kaggle XGBoost"]
                },
                {
                    day: 24,
                    title: "Mini-Project #1",
                    topics: ["Small Kaggle dataset", "Baseline model"],
                    sources: ["Kaggle Getting Started"]
                }
            ]
        },
        {
            week: 5,
            title: "Neural Networks & Deep Learning",
            days: [
                {
                    day: 25,
                    title: "Perceptron",
                    topics: ["Perceptron & activations", "PyTorch install"],
                    sources: ["fast.ai DL"]
                },
                {
                    day: 26,
                    title: "Feed-Forward Networks",
                    topics: ["Backprop intuition"],
                    sources: ["Andrew Ng DL Spec"]
                },
                {
                    day: 27,
                    title: "Training Dynamics",
                    topics: ["LR, epochs, batch", "LR finder"],
                    sources: ["fast.ai"]
                },
                {
                    day: 28,
                    title: "CNN Basics",
                    topics: ["CNN concept", "LeNet MNIST"],
                    sources: ["CS231n"]
                },
                {
                    day: 29,
                    title: "Transfer Learning",
                    topics: ["Fine-tuning", "ResNet"],
                    sources: ["fast.ai"]
                },
                {
                    day: 30,
                    title: "Recurrent Nets",
                    topics: ["RNN basics", "Text generation"],
                    sources: ["CS224n"]
                }
            ]
        },
        {
            week: 6,
            title: "Transformers, LLMs & Prompting",
            days: [
                {
                    day: 31,
                    title: "Transformer Architecture",
                    topics: ["Self-attention", "Illustrated Transformer"],
                    sources: ["Jay Alammar"]
                },
                {
                    day: 32,
                    title: "Hugging Face",
                    topics: ["Text summarization pipeline"],
                    sources: ["HF docs"]
                },
                {
                    day: 33,
                    title: "Prompt Engineering",
                    topics: ["Zero/one/few-shot", "CoT"],
                    sources: ["DeepLearning.AI"]
                },
                {
                    day: 34,
                    title: "Fine-tuning vs RAG",
                    topics: ["LangChain RAG demo"],
                    sources: ["LangChain docs"]
                },
                {
                    day: 35,
                    title: "LLM Safety",
                    topics: ["Bias", "Holistic eval"],
                    sources: ["Stanford CRFM"]
                },
                {
                    day: 36,
                    title: "AI Ethics",
                    topics: ["AIMA ethics chapter", "UNESCO guidelines"],
                    sources: ["AIMA", "UNESCO"]
                }
            ]
        },
        {
            week: 7,
            title: "Data, Deployment & MLOps",
            days: [
                {
                    day: 37,
                    title: "Data Versioning",
                    topics: ["DVC intro"],
                    sources: ["DVC docs"]
                },
                {
                    day: 38,
                    title: "Model Serving",
                    topics: ["FastAPI REST"],
                    sources: ["FastAPI docs"]
                },
                {
                    day: 39,
                    title: "Docker for ML",
                    topics: ["Containerize model"],
                    sources: ["Docker docs"]
                },
                {
                    day: 40,
                    title: "Monitoring & Drift",
                    topics: ["Evidently concepts"],
                    sources: ["Evidently AI"]
                },
                {
                    day: 41,
                    title: "CI/CD for ML",
                    topics: ["ML pipelines"],
                    sources: ["Google MLOps"]
                },
                {
                    day: 42,
                    title: "Capstone Planning",
                    topics: ["Project outline"],
                    sources: ["fast.ai"]
                }
            ]
        },
        {
            week: 8,
            title: "Capstone Execution & Review",
            days: [
                {
                    day: 43,
                    title: "Data Ingestion",
                    topics: ["EDA with pandas"],
                    sources: ["pandas docs"]
                },
                {
                    day: 44,
                    title: "Model Training",
                    topics: ["W&B tracking"],
                    sources: ["W&B docs"]
                },
                {
                    day: 45,
                    title: "Hyperparameter Tuning",
                    topics: ["Optuna basics"],
                    sources: ["Optuna docs"]
                },
                {
                    day: 46,
                    title: "Model Deployment",
                    topics: ["HF Spaces"],
                    sources: ["HF docs"]
                },
                {
                    day: 47,
                    title: "Documentation",
                    topics: ["README + demo video"],
                    sources: ["fast.ai"]
                },
                {
                    day: 48,
                    title: "Final Review",
                    topics: ["Next learning path"],
                    sources: ["AI/ML Roadmap"]
                }
            ]
        }
    ],
    resources: [
        "Elements of AI – https://www.elementsofai.com",
        "AI for Beginners (Microsoft) – https://microsoft.github.io/AI-For-Beginners/",
        "Russell & Norvig AIMA – https://aima.cs.berkeley.edu",
        "Andrew Ng ML Specialization – https://www.coursera.org/specializations/machine-learning-introduction",
        "fast.ai – https://course.fast.ai",
        "Hugging Face – https://huggingface.co/docs/transformers",
        "Kaggle Learn – https://www.kaggle.com/learn"
    ]
};

// Initialize the application
new AILearningPlan();