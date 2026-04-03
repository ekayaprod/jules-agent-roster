const FusionAnimation = require('./FusionAnimation');

describe('FusionAnimation', () => {
    let animation;

    beforeEach(() => {
        jest.useFakeTimers();

        // Mock DOM elements
        document.body.innerHTML = `
            <div id="fusionAnimationOverlay">
                <div class="anim-icon left"></div>
                <div class="anim-icon right"></div>
                <div class="anim-icon result"></div>
                <div class="anim-result"></div>
                <div class="anim-particles"></div>
            </div>
            <button id="fuseBtn">Fuse</button>
            <div id="fusionLabContent"></div>
            <div id="fusionOutputWrapper" class="open"></div>
        `;

        // Mock format utils
        global.FormatUtils = {
            extractIcon: jest.fn().mockReturnValue('⭐'),
            extractDisplayName: jest.fn().mockReturnValue('Fused Agent'),
            escapeHTML: jest.fn((str) => str)
        };

        // Mock dom utils
        global.DOMUtils = {
            setButtonState: jest.fn()
        };

        // Mock window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        animation = FusionAnimation();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
        document.body.innerHTML = '';
        delete global.FormatUtils;
        delete global.DOMUtils;
    });

    test('runAnimation handles missing DOM elements gracefully', async () => {
        document.body.innerHTML = ''; // Clear DOM
        const callback = jest.fn();

        await animation.runAnimation({}, {}, {}, callback);

        expect(callback).not.toHaveBeenCalled();
    });

    test('runAnimation executes full animation sequence', async () => {
        const agentA = { emoji: 'A' };
        const agentB = { emoji: 'B' };
        const result = { tier: 'Epic' };
        const callback = jest.fn();

        const promise = animation.runAnimation(agentA, agentB, result, callback);

        // Fast-forward animation delay
        await jest.advanceTimersByTimeAsync(3500);

        await promise;

        const overlay = document.getElementById('fusionAnimationOverlay');
        expect(overlay.classList.contains('tier-epic')).toBe(true);

        const particlesContainer = document.querySelector('.anim-particles');
        expect(particlesContainer.children.length).toBe(160); // Epic tier count

        expect(global.DOMUtils.setButtonState).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();
    });

    test('runAnimation respects reduced motion setting', async () => {
        window.matchMedia.mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)'
        }));

        const callback = jest.fn();
        await animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, { tier: 'Common' }, callback);

        const overlay = document.getElementById('fusionAnimationOverlay');
        expect(overlay.classList.contains('active')).toBe(false);
        expect(callback).toHaveBeenCalled();
    });

    test('runAnimation handles missing optional DOM elements', async () => {
        document.body.innerHTML = `
            <div id="fusionAnimationOverlay">
                <div class="anim-icon left"></div>
                <div class="anim-icon right"></div>
            </div>
            <button id="fuseBtn">Fuse</button>
        `;
        animation = FusionAnimation();

        const callback = jest.fn();
        const promise = animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, { tier: 'Rare' }, callback);
        await jest.advanceTimersByTimeAsync(3500);
        await promise;
        expect(callback).toHaveBeenCalled();
    });

    test('runAnimation falls back to Common tier if result.tier is missing or unknown', async () => {
        const callback = jest.fn();
        const promise1 = animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, {}, callback);
        await jest.advanceTimersByTimeAsync(3500);
        await promise1;

        const overlay = document.getElementById('fusionAnimationOverlay');
        expect(overlay.classList.contains('tier-common')).toBe(true);

        const callback2 = jest.fn();
        const promise2 = animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, { tier: 'FakeTier' }, callback2);
        await jest.advanceTimersByTimeAsync(3500);
        await promise2;
        expect(overlay.classList.contains('tier-faketier')).toBe(true);
        const particlesContainer = document.querySelector('.anim-particles');
        expect(particlesContainer.children.length).toBe(0); // Falls back to common config
    });

    test('runAnimation generates correct particle counts for different tiers', async () => {
        const tiers = {
            'Uncommon': 20,
            'Rare': 40,
            'Legendary': 300,
            'Mythic': 500
        };

        for (const [tier, count] of Object.entries(tiers)) {
            const promise = animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, { tier });
            await jest.advanceTimersByTimeAsync(3500);
            await promise;
            const particlesContainer = document.querySelector('.anim-particles');
            expect(particlesContainer.children.length).toBe(count);
        }
    });

    test('runAnimation works without window.matchMedia', async () => {
        const originalMatchMedia = window.matchMedia;
        delete window.matchMedia;

        const promise = animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, { tier: 'Common' });
        await jest.advanceTimersByTimeAsync(3500);
        await promise;

        const overlay = document.getElementById('fusionAnimationOverlay');
        expect(overlay.classList.contains('active')).toBe(false); // It removes active after 3500ms

        window.matchMedia = originalMatchMedia;
    });

    test('runAnimation works without a callback', async () => {
        const promise = animation.runAnimation({ emoji: 'A' }, { emoji: 'B' }, { tier: 'Common' });
        await jest.advanceTimersByTimeAsync(3500);
        await promise;

        const overlay = document.getElementById('fusionAnimationOverlay');
        expect(overlay.classList.contains('active')).toBe(false);
    });
});
