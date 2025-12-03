import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, TrendingUp, PiggyBank, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CanvasParticles from '@/components/CanvasParticles';
import ScreenPets from '@/components/ScreenPets';
import { useAppStore } from '@/lib/store';

export default function Landing() {
  const navigate = useNavigate();
  const { login, settings } = useAppStore();

  const handleDemoLogin = async () => {
    const success = await login('demo@demo.com', 'Demo1234');
    if (success) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: Wallet,
      title: 'Track Expenses',
      description: 'Monitor every rupee with ease. Categorize and analyze your spending patterns.',
    },
    {
      icon: TrendingUp,
      title: 'Visual Insights',
      description: 'Beautiful charts and graphs that make understanding your finances a breeze.',
    },
    {
      icon: PiggyBank,
      title: 'Smart Budgets',
      description: 'Set category budgets and get alerts before you overspend.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data stays private and secure with encryption.',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CanvasParticles enabled={settings.particlesEnabled} particleCount={120} />
      <ScreenPets />
      
      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">₹</span>
            </div>
            <span className="font-display font-bold text-lg">Simple Budget Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="neon">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium mb-6">
              Free • No credit card required
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            See your money{' '}
            <span className="text-gradient-neon">clearly.</span>
            <br />
            Save with{' '}
            <span className="text-glow-cyan">confidence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Take control of your finances with beautiful visualizations, smart budgets, 
            and insights that help you save more every month.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth/signup">
              <Button variant="neon" size="xl" className="w-full sm:w-auto">
                Start Free
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Button 
              variant="neonOutline" 
              size="xl" 
              onClick={handleDemoLogin}
              className="w-full sm:w-auto"
            >
              Try Demo
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '₹50Cr+', label: 'Tracked' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9★', label: 'Rating' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl font-bold text-glow-cyan mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{' '}
            <span className="text-gradient-neon">manage money</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Powerful features wrapped in a beautiful, easy-to-use interface.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-6 rounded-xl group hover:border-neon-cyan/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center mb-4 group-hover:bg-neon-cyan/20 transition-colors">
                  <Icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card border-neon-cyan/30 rounded-2xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-pink/5" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to take control?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of users who are already saving smarter with Simple Budget Tracker.
            </p>
            <Link to="/auth/signup">
              <Button variant="neon" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
              <span className="text-primary-foreground font-bold">₹</span>
            </div>
            <span className="font-display font-semibold">Simple Budget Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Simple Budget Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
