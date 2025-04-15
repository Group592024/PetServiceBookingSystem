import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaShieldAlt, FaTimes } from 'react-icons/fa';

const TermsPrivacyPopup = () => {
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const Modal = ({ title, content, onClose, icon }) => (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-full">
                                {icon}
                            </div>
                            <h2 className="text-2xl font-bold text-white">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        <div className="text-gray-700 space-y-4 text-base leading-relaxed">
                            {content}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 flex justify-end">
                        <button
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center space-x-2 font-medium"
                            onClick={onClose}
                        >
                            <span>I Understand</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    const termsContent = (
        <>
            <p className="font-medium text-lg text-blue-700 mb-3">Welcome to our platform!</p>
            <p>By using our services, you agree to the following Terms of Service:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
                <li>You must be at least 18 years old or have guardian supervision.</li>
                <li>You agree not to use our services for any unlawful activities.</li>
                <li>We reserve the right to suspend or terminate accounts at our discretion.</li>
                <li>All content and data are subject to monitoring to ensure compliance.</li>
                <li>Any changes to these terms will be notified on our website.</li>
            </ul>
            <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 italic">
                By continuing to use the platform, you acknowledge that you have read and accepted all the terms above.
            </p>
        </>
    );

    const privacyContent = (
        <>
            <p className="font-medium text-lg text-blue-700 mb-3">Your Privacy Matters to Us</p>
            <p>This Privacy Policy explains how we collect, use, and protect your personal information:</p>
            <ul className="list-disc pl-6 my-4 space-y-2">
                <li>We collect personal data such as name, email, and usage activity.</li>
                <li>Your data is used to improve services, provide support, and personalize your experience.</li>
                <li>We do not sell or share your data with third parties without consent.</li>
                <li>We use encryption and secure storage to protect your data.</li>
                <li>You have the right to request access or deletion of your data anytime.</li>
            </ul>
            <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 italic">
                If you have any questions regarding our privacy practices, please contact our support team.
            </p>
        </>
    );

    return (
        <>
            <button
                type="button"
                className="text-blue-600 font-medium hover:text-blue-800 underline-offset-2 hover:underline transition-colors inline-flex items-center"
                onClick={() => setShowTerms(true)}
            >
                Terms of Service
            </button>
            {' and '}
            <button
                type="button"
                className="text-blue-600 font-medium hover:text-blue-800 underline-offset-2 hover:underline transition-colors inline-flex items-center"
                onClick={() => setShowPrivacy(true)}
            >
                Privacy Policy
            </button>

            {showTerms && (
                <Modal
                    title="Terms of Service"
                    content={termsContent}
                    onClose={() => setShowTerms(false)}
                    icon={<FaBook className="text-blue-700" size={18} />}
                />
            )}

            {showPrivacy && (
                <Modal
                    title="Privacy Policy"
                    content={privacyContent}
                    onClose={() => setShowPrivacy(false)}
                    icon={<FaShieldAlt className="text-blue-700" size={18} />}
                />
            )}
        </>
    );
};

export default TermsPrivacyPopup;
