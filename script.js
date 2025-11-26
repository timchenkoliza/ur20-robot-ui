    <script>
        // State Management
        const state = {
            currentView: 'dashboard',
            currentMode: 'autonomous',
            robots: [
                { id: 1, name: 'UR20-1', status: 'running', location: 'Lobachevsky', items: 156, speed: 85, uptime: '4h 32m' },
                { id: 2, name: 'UR20-2', status: 'running', location: 'Lobachevsky', items: 142, speed: 78, uptime: '4h 28m' },
                { id: 3, name: 'UR20-3', status: 'idle', location: 'SEMANT', items: 0, speed: 0, uptime: '2h 15m' },
                { id: 4, name: 'UR20-4', status: 'error', location: 'Belgrade', items: 0, speed: 0, uptime: '1h 45m' },
                { id: 5, name: 'UR20-5', status: 'idle', location: 'Storage', items: 0, speed: 0, uptime: '6h 02m' },
            ],
            selectedRobot: null,
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            renderRobotGrid();
            drawDebugCanvas();
            updateMetrics();
        });

        // View Management
        function switchView(view) {
            document.querySelectorAll('[id$="-view"]').forEach(el => el.classList.add('hidden'));
            document.getElementById(`${view}-view`).classList.remove('hidden');
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById('viewTitle').textContent = 
                view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g, ' ');
            state.currentView = view;
        }

        function setMode(mode) {
            state.currentMode = mode;
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
        }

        // Robot Grid
        function renderRobotGrid() {
            const grid = document.getElementById('robotGrid');
            grid.innerHTML = state.robots.map(robot => `
                <div class="robot-card ${state.selectedRobot === robot.id ? 'selected' : ''}" onclick="selectRobot(${robot.id})">
                    <div class="robot-name">${robot.name}</div>
                    <div class="status-badge ${robot.status}">
                        <span class="status-indicator"></span>
                        ${robot.status.charAt(0).toUpperCase() + robot.status.slice(1)}
                    </div>
                    <div class="robot-metrics">
                        <div class="metric">
                            <span class="metric-label">Location:</span>
                            <span class="metric-value">${robot.location}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Items:</span>
                            <span class="metric-value">${robot.items}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Speed:</span>
                            <span class="metric-value">${robot.speed}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Uptime:</span>
                            <span class="metric-value">${robot.uptime}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function selectRobot(id) {
            state.selectedRobot = state.selectedRobot === id ? null : id;
            renderRobotGrid();
        }

        // Actions
        function executeAction(action) {
            const messages = {
                'start-all': '▶ All robots started',
                'stop-all': '⏹ All robots stopped',
                'emergency-stop': '🚨 Emergency stop activated',
                'restart': '🔄 System restarted'
            };
            addLog(messages[action]);
            updateMetrics();
        }

        function operatorStart() {
            addLog('▶ Operator started task');
            state.robots[0].status = 'running';
            renderRobotGrid();
        }

        function operatorStop() {
            addLog('⏹ Operator stopped task');
            state.robots[0].status = 'idle';
            renderRobotGrid();
        }

        function operatorFix(action) {
            const messages = {
                'restart-task': '🔄 Task restarted by operator',
                'clear-error': '✓ Error cleared'
            };
            addLog(messages[action]);
        }

        function setParameter(param, value) {
            event.target.parentElement.querySelectorAll('.param-option').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            addLog(`⚙️ Parameter changed: ${param} = ${value}`);
        }

        function updateMetrics() {
            document.getElementById('activeRobots').textContent = `${state.robots.filter(r => r.status !== 'idle').length}/5`;
            document.getElementById('throughput').textContent = `${Math.floor(Math.random() * 100) + 300} items/h`;
            document.getElementById('latency').textContent = `${Math.floor(Math.random() * 30) + 40}ms`;
            document.getElementById('errorRate').textContent = `${(Math.random() * 2).toFixed(1)}%`;
        }

        function addLog(message) {
            const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            if (message.includes('✓')) logEntry.classList.add('success');
            if (message.includes('⚠')) logEntry.classList.add('warning');
            if (message.includes('Error')) logEntry.classList.add('error');
            logEntry.textContent = `[${now}] ${message}`;
            
            const panel = document.getElementById('debugLogs') || document.querySelector('.logs-panel');
            if (panel) {
                panel.insertBefore(logEntry, panel.firstChild);
                if (panel.children.length > 10) panel.removeChild(panel.lastChild);
            }
        }

        // Canvas Visualization
        function drawDebugCanvas() {
            const canvases = document.querySelectorAll('.visualization-canvas');
            canvases.forEach(canvas => {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw grid background
                ctx.strokeStyle = 'rgba(0, 102, 204, 0.1)';
                ctx.lineWidth = 1;
                for (let i = 0; i < canvas.width; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(i, 0);
                    ctx.lineTo(i, canvas.height);
                    ctx.stroke();
                }
                for (let i = 0; i < canvas.height; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(canvas.width, i);
                    ctx.stroke();
                }

                // Draw detection boxes
                const boxes = [
                    { x: 100, y: 80, w: 60, h: 50, conf: '96.8%', id: 'Box #2 (Selected)' },
                    { x: 220, y: 60, w: 70, h: 65, conf: '94.2%', id: 'Box #1' },
                    { x: 140, y: 160, w: 50, h: 45, conf: '92.1%', id: 'Box #3' }
                ];

                boxes.forEach((box, i) => {
                    const isSelected = i === 0;
                    ctx.strokeStyle = isSelected ? '#00ff00' : '#0066cc';
                    ctx.lineWidth = isSelected ? 3 : 2;
                    ctx.strokeRect(box.x, box.y, box.w, box.h);

                    ctx.fillStyle = isSelected ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 102, 204, 0.1)';
                    ctx.fillRect(box.x, box.y, box.w, box.h);

                    ctx.fillStyle = isSelected ? '#00ff00' : '#0066cc';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(`${box.id} [${box.conf}]`, box.x + 4, box.y - 4);
                });
            });
        }

        function startDemo() {
            addLog('▶ Demo started - AI visualization enabled');
        }

        function stopDemo() {
            addLog('⏹ Demo stopped');
        }

        function nextFrame() {
            addLog('⏭ Next frame - refreshing detection');
            drawDebugCanvas();
        }

        // Responsive
        window.addEventListener('resize', () => {
            if (state.currentView === 'developers' || state.currentView === 'demo') {
                drawDebugCanvas();
            }
            
        });
    </script>
