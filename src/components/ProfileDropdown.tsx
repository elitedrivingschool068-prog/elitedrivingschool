'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SignOutButton from './SignOutButton';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './ProfileDropdown.module.css';

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [initials, setInitials] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('profile_pic_url, first_name, last_name, role')
                    .eq('id', user.id)
                    .single();

                if (profile?.profile_pic_url) {
                    setProfilePic(profile.profile_pic_url);
                } else {
                    const emailInitial = user.email ? user.email[0].toUpperCase() : '';
                    setInitials(emailInitial);
                }
                
                // Check if user is admin
                setIsAdmin(profile?.role === 'admin');
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button className={styles.toggleButton} onClick={toggleDropdown}>
                {profilePic ? (
                    <Image src={profilePic} alt="Profile" className={styles.profilePic} width={40} height={40} />
                ) : (
                    <div className={styles.initials}>{initials}</div>
                )}
            </button>
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <Link href="/dashboard/profile" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                        Edit Profile
                    </Link>
                    {isAdmin && (
                        <>
                            <div className={styles.divider}></div>
                            <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                                🔧 Admin Panel
                            </Link>
                        </>
                    )}
                    <div className={styles.divider}></div>
                    <SignOutButton className={styles.dropdownItem} />
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;