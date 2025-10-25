'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function TermsModal({ isOpen, onClose, onAccept }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium text-white mb-4">
                  Tournament Creation Terms & Conditions (RAID Arena)
                </Dialog.Title>

                <div className="mt-2 space-y-4 text-gray-300 text-sm">
                  <p>
                    By creating and hosting a tournament on RAID Arena (“RAID”), you agree to the following terms and conditions:
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">1. Tournament Organization</h4>
                    <p>
                      As the organizer, you are responsible for setting clear rules, schedules, formats, and eligibility criteria.
                    </p>
                    <p>
                      All tournaments must comply with RAID’s Community Guidelines and Fair Play Rules.
                    </p>
                    <p>
                      RAID reserves the right to suspend or remove tournaments that violate platform policies.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">2. Prize Distribution</h4>
                    <p>
                      All prizes must be distributed exactly as stated in the tournament description.
                    </p>
                    <p>
                      RAID manages and processes prize distribution to ensure fairness and transparency.
                    </p>
                    <p>
                      Prize pools must reward multiple placements (e.g., 1st, 2nd, 3rd) to reflect a competitive skill-based structure.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">3. Fair Play & Integrity</h4>
                    <p>
                      Outcomes must be determined by skill, performance, and strategy, not by chance.
                    </p>
                    <p>
                      Cheating, match-fixing, use of unauthorized software, or exploiting system loopholes is strictly prohibited.
                    </p>
                    <p>
                      Gambling, betting, or any chance-based mechanics are not permitted on RAID.
                    </p>
                    <p>
                      Any violation may result in disqualification, forfeiture of prizes, and account suspension.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white font-medium">4. Communication & Transparency</h4>
                    <p>
                      Organizers must maintain clear and timely communication with participants regarding tournament rules, schedules, updates, and disputes.
                    </p>
                    <p>
                      Any rule changes after tournament launch must be announced to all participants in advance.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='text-white font-medium'>5. Dispute Resolution</h4>
                    <p>
                      In the event of conflicting match results, RAID’s dispute resolution team may request supporting evidence (screenshots, videos, etc.).
                    </p>
                    <p>
                      RAID’s decision in disputes is final and binding to ensure fairness.
                    </p>

                  </div>

                  <div className='space-y-2'>
                    <h4 className='text-white font-medium'>6. Compliance</h4>
                    <p>
                      By hosting on RAID, you agree that tournaments are skill-based competitions, not games of chance or gambling activities.
                    </p>
                    <p>
                      All organizers must comply with applicable laws and regulations in Ghana and any other jurisdiction where participants reside.
                    </p>

                  </div>

                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    onClick={onAccept}
                  >
                    I Accept
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}