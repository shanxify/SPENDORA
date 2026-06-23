import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_STEPS = [
  {
    target: '[data-tour="nav-upload"]',
    content: 'Start here — upload your bank statement PDF to import your transactions.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="merchant-category-dropdown"]',
    content: 'Now pick a category for this merchant. Go ahead — try it!',
    disableBeacon: true,
    hideFooter: true, // no Next button — this step is action-gated
    spotlightClicks: true,
  },
  {
    target: '[data-tour="nav-dashboard"]',
    content: "You're all set — your Dashboard shows spending breakdown, top merchants, and trends, built automatically from your statements.",
    disableBeacon: true,
  },
];

const OnboardingTour = () => {
  // TEMPORARY: set to false before deploying to real users
  const FORCE_TOUR_FOR_TESTING = true;

  const { user, markOnboardingSeen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isReplay, setIsReplay] = useState(false);

  const waitForElementThenAdvance = (selector, nextIndex, maxAttempts = 30) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (document.querySelector(selector)) {
        const el = document.querySelector(selector);
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || attempts >= maxAttempts) {
          setStepIndex(nextIndex);
        } else {
          requestAnimationFrame(check);
        }
      } else if (attempts < maxAttempts) {
        requestAnimationFrame(check);
      } else {
        console.warn('Onboarding tour: target element never appeared, stopping tour.');
        setRun(false);
      }
    };
    requestAnimationFrame(check);
  };

  // Wait for initial element to render before running the tour
  useEffect(() => {
    if (FORCE_TOUR_FOR_TESTING || (user && !user.user_metadata?.has_seen_onboarding)) {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (document.querySelector('[data-tour="nav-upload"]')) {
          setRun(true);
        } else if (attempts < 30) {
          requestAnimationFrame(check);
        } else {
          console.warn('Onboarding tour: initial target element never appeared, auto-running fallback.');
          setRun(true);
        }
      };
      requestAnimationFrame(check);
    }
  }, [user]);

  // Handle replay start from window global
  useEffect(() => {
    window.__startOnboardingTour = () => {
      setStepIndex(0);
      setIsReplay(true);
      
      // Navigate to Dashboard/Home first
      navigate('/');
      
      // Wait for target to render
      let attempts = 0;
      const check = () => {
        attempts++;
        if (document.querySelector('[data-tour="nav-upload"]')) {
          setRun(true);
        } else if (attempts < 30) {
          requestAnimationFrame(check);
        } else {
          setRun(true);
        }
      };
      requestAnimationFrame(check);
    };
    return () => { delete window.__startOnboardingTour; };
  }, [navigate]);

  // Escape hatch to force stop the tour in case of issues
  useEffect(() => {
    window.__forceStopOnboardingTour = () => setRun(false);
    return () => { delete window.__forceStopOnboardingTour; };
  }, []);

  const handleCallback = (data) => {
    const { status, index, action } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      if (!isReplay) {
        markOnboardingSeen();
      }
      return;
    }
    // Advance from step 0 to step 1 normally, navigating to Merchant Mapping
    if (index === 0 && action === 'next') {
      navigate('/merchants');
      waitForElementThenAdvance('[data-tour="merchant-category-dropdown"]', 1);
    }
    // Advance from step 1 to step 2 only happens via the manual trigger
    // below (handleCategoryAssigned), not through Joyride's own Next button
    if (index === 2 && action === 'next') {
      navigate('/');
      waitForElementThenAdvance('[data-tour="nav-dashboard"]', 2);
    }
  };

  // Called externally when the user actually assigns a category during
  // step 1 of the tour — advances the gated step programmatically
  useEffect(() => {
    window.__advanceOnboardingStep = () => {
      if (run && stepIndex === 1) {
        navigate('/');
        waitForElementThenAdvance('[data-tour="nav-dashboard"]', 2);
      }
    };
    return () => { delete window.__advanceOnboardingStep; };
  }, [run, stepIndex, navigate]);

  if (!run) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      callback={handleCallback}
      debug={true}
      styles={{
        options: {
          primaryColor: '#a78bfa',
          backgroundColor: '#1a1a24',
          textColor: '#ffffff',
          arrowColor: '#1a1a24',
          overlayColor: 'rgba(0,0,0,0.55)',
          zIndex: 10000,
        },
      }}
    />
  );
};

export default OnboardingTour;
