import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, FileText, BarChart3, Home } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { path: '/', label: 'Create Form', icon: Plus, description: 'Build new forms' },
        { path: '/fill', label: 'Fill Form', icon: FileText, description: 'Answer forms' },
        {
            path: '/responses',
            label: 'View Responses',
            icon: BarChart3,
            description: 'See form results',
        },
    ];

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-blue-600"
                        >
                            <Home className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                            <span className="hidden xs:inline">Form Builder</span>
                            <span className="xs:hidden">FB</span>
                        </Link>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base lg:text-lg ${
                                        isActive(item.path)
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                    title={item.description}
                                >
                                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                    <span className="hidden md:inline">{item.label}</span>
                                    <span className="md:hidden sm:inline">
                                        {item.label.split(' ')[0]}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
