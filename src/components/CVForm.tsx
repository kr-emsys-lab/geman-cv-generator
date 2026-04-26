import React from 'react';
import { CVData } from '../types/cv-data';
import { Plus, Trash2 } from 'lucide-react';

interface CVFormProps {
  cvData: CVData;
  onUpdate: (updates: Partial<CVData>) => void;
  language: 'de' | 'en';
}

export function CVForm({ cvData, onUpdate, language }: CVFormProps) {
  const updatePersonal = (field: keyof CVData['personal'], value: string) => {
    onUpdate({
      personal: {
        ...cvData.personal,
        [field]: value
      }
    });
  };

  const addWorkEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      startDate: '',
      endDate: '',
      role: '',
      employer: '',
      city: '',
      bullets: ['']
    };
    onUpdate({
      experience: [...cvData.experience, newEntry]
    });
  };

  const updateWorkEntry = (index: number, field: keyof CVData['experience'][0], value: string | string[]) => {
    const updated = [...cvData.experience];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ experience: updated });
  };

  const removeWorkEntry = (index: number) => {
    onUpdate({
      experience: cvData.experience.filter((_, i) => i !== index)
    });
  };

  const addEducationEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      startDate: '',
      endDate: '',
      degree: '',
      institution: '',
      city: '',
      grade: '',
      bullets: ['']
    };
    onUpdate({
      education: [...cvData.education, newEntry]
    });
  };

  const updateEducationEntry = (index: number, field: keyof CVData['education'][0], value: string | string[]) => {
    const updated = [...cvData.education];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ education: updated });
  };

  const removeEducationEntry = (index: number) => {
    onUpdate({
      education: cvData.education.filter((_, i) => i !== index)
    });
  };

  const addSkill = (category: keyof CVData['skills']) => {
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      level: ''
    };
    onUpdate({
      skills: {
        ...cvData.skills,
        [category]: [...cvData.skills[category], newSkill]
      }
    });
  };

  const updateSkill = (category: keyof CVData['skills'], index: number, field: keyof CVData['skills']['languages'][0], value: string) => {
    const updated = [...cvData.skills[category]];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({
      skills: {
        ...cvData.skills,
        [category]: updated
      }
    });
  };

  const removeSkill = (category: keyof CVData['skills'], index: number) => {
    onUpdate({
      skills: {
        ...cvData.skills,
        [category]: cvData.skills[category].filter((_, i) => i !== index)
      }
    });
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      url: ''
    };
    onUpdate({
      projects: [...cvData.projects, newProject]
    });
  };

  const updateProject = (index: number, field: keyof CVData['projects'][0], value: string) => {
    const updated = [...cvData.projects];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ projects: updated });
  };

  const removeProject = (index: number) => {
    onUpdate({
      projects: cvData.projects.filter((_, i) => i !== index)
    });
  };

  const addCertificate = () => {
    const newCert = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: ''
    };
    onUpdate({
      certificates: [...cvData.certificates, newCert]
    });
  };

  const updateCertificate = (index: number, field: keyof CVData['certificates'][0], value: string) => {
    const updated = [...cvData.certificates];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ certificates: updated });
  };

  const removeCertificate = (index: number) => {
    onUpdate({
      certificates: cvData.certificates.filter((_, i) => i !== index)
    });
  };

  const updateBullets = (array: string[], index: number, value: string) => {
    const updated = [...array];
    updated[index] = value;
    return updated;
  };

  const addBullet = (array: string[]) => {
    return [...array, ''];
  };

  const removeBullet = (array: string[], index: number) => {
    return array.filter((_, i) => i !== index);
  };

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'de' ? 'Persönliche Daten' : 'Personal Information'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Vorname' : 'First Name'}
            </label>
            <input
              type="text"
              value={cvData.personal.firstName}
              onChange={(e) => updatePersonal('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Nachname' : 'Last Name'}
            </label>
            <input
              type="text"
              value={cvData.personal.lastName}
              onChange={(e) => updatePersonal('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Titel' : 'Title'}
            </label>
            <input
              type="text"
              value={cvData.personal.title}
              onChange={(e) => updatePersonal('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'de' ? 'z.B. Dr., Prof.' : 'e.g. Dr., Prof.'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Straße' : 'Street'}
            </label>
            <input
              type="text"
              value={cvData.personal.street}
              onChange={(e) => updatePersonal('street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Hausnummer' : 'House Number'}
            </label>
            <input
              type="text"
              value={cvData.personal.houseNumber}
              onChange={(e) => updatePersonal('houseNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'PLZ' : 'Postal Code'}
            </label>
            <input
              type="text"
              value={cvData.personal.postalCode}
              onChange={(e) => updatePersonal('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Stadt' : 'City'}
            </label>
            <input
              type="text"
              value={cvData.personal.city}
              onChange={(e) => updatePersonal('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Telefon' : 'Phone'}
            </label>
            <input
              type="tel"
              value={cvData.personal.phone}
              onChange={(e) => updatePersonal('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={cvData.personal.email}
              onChange={(e) => updatePersonal('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              value={cvData.personal.linkedin}
              onChange={(e) => updatePersonal('linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xing
            </label>
            <input
              type="url"
              value={cvData.personal.xing}
              onChange={(e) => updatePersonal('xing', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Geburtsdatum' : 'Date of Birth'}
            </label>
            <input
              type="text"
              value={cvData.personal.dateOfBirth}
              onChange={(e) => updatePersonal('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="DD.MM.YYYY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Geburtsort' : 'Place of Birth'}
            </label>
            <input
              type="text"
              value={cvData.personal.placeOfBirth}
              onChange={(e) => updatePersonal('placeOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Nationalität' : 'Nationality'}
            </label>
            <input
              type="text"
              value={cvData.personal.nationality}
              onChange={(e) => updatePersonal('nationality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'de' ? 'Familienstand' : 'Marital Status'}
            </label>
            <input
              type="text"
              value={cvData.personal.maritalStatus}
              onChange={(e) => updatePersonal('maritalStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'de' ? 'Berufserfahrung' : 'Work Experience'}
          </h3>
          <button
            onClick={addWorkEntry}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {language === 'de' ? 'Hinzufügen' : 'Add'}
          </button>
        </div>
        <div className="space-y-4">
          {cvData.experience.map((entry, index) => (
            <div key={entry.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{language === 'de' ? 'Position' : 'Position'} {index + 1}</h4>
                <button
                  onClick={() => removeWorkEntry(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Startdatum' : 'Start Date'}
                  </label>
                  <input
                    type="text"
                    value={entry.startDate}
                    onChange={(e) => updateWorkEntry(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Enddatum' : 'End Date'}
                  </label>
                  <input
                    type="text"
                    value={entry.endDate}
                    onChange={(e) => updateWorkEntry(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'de' ? 'MM/YYYY oder heute' : 'MM/YYYY or today'}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Position' : 'Role'}
                  </label>
                  <input
                    type="text"
                    value={entry.role}
                    onChange={(e) => updateWorkEntry(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Arbeitgeber' : 'Employer'}
                  </label>
                  <input
                    type="text"
                    value={entry.employer}
                    onChange={(e) => updateWorkEntry(index, 'employer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Stadt' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={entry.city}
                    onChange={(e) => updateWorkEntry(index, 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'de' ? 'Aufgaben und Verantwortlichkeiten' : 'Responsibilities'}
                </label>
                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => updateWorkEntry(index, 'bullets', updateBullets(entry.bullets, bulletIndex, e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'de' ? 'Beschreibung der Aufgabe...' : 'Task description...'}
                    />
                    <button
                      onClick={() => updateWorkEntry(index, 'bullets', removeBullet(entry.bullets, bulletIndex))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateWorkEntry(index, 'bullets', addBullet(entry.bullets))}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'de' ? 'Aufgabe hinzufügen' : 'Add task'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'de' ? 'Ausbildung' : 'Education'}
          </h3>
          <button
            onClick={addEducationEntry}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {language === 'de' ? 'Hinzufügen' : 'Add'}
          </button>
        </div>
        <div className="space-y-4">
          {cvData.education.map((entry, index) => (
            <div key={entry.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{language === 'de' ? 'Ausbildung' : 'Education'} {index + 1}</h4>
                <button
                  onClick={() => removeEducationEntry(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Startdatum' : 'Start Date'}
                  </label>
                  <input
                    type="text"
                    value={entry.startDate}
                    onChange={(e) => updateEducationEntry(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Enddatum' : 'End Date'}
                  </label>
                  <input
                    type="text"
                    value={entry.endDate}
                    onChange={(e) => updateEducationEntry(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YYYY"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Abschluss' : 'Degree'}
                  </label>
                  <input
                    type="text"
                    value={entry.degree}
                    onChange={(e) => updateEducationEntry(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Institution' : 'Institution'}
                  </label>
                  <input
                    type="text"
                    value={entry.institution}
                    onChange={(e) => updateEducationEntry(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Stadt' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={entry.city}
                    onChange={(e) => updateEducationEntry(index, 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Note/Abschluss' : 'Grade/Degree'}
                  </label>
                  <input
                    type="text"
                    value={entry.grade}
                    onChange={(e) => updateEducationEntry(index, 'grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'de' ? 'Beschreibung' : 'Description'}
                </label>
                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => updateEducationEntry(index, 'bullets', updateBullets(entry.bullets, bulletIndex, e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'de' ? 'Beschreibung...' : 'Description...'}
                    />
                    <button
                      onClick={() => updateEducationEntry(index, 'bullets', removeBullet(entry.bullets, bulletIndex))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateEducationEntry(index, 'bullets', addBullet(entry.bullets))}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'de' ? 'Beschreibung hinzufügen' : 'Add description'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'de' ? 'Kenntnisse' : 'Skills'}
        </h3>

        {/* Languages */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{language === 'de' ? 'Sprachen' : 'Languages'}</h4>
            <button
              onClick={() => addSkill('languages')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              {language === 'de' ? 'Hinzufügen' : 'Add'}
            </button>
          </div>
          <div className="space-y-2">
            {cvData.skills.languages.map((skill, index) => (
              <div key={skill.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill('languages', index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'de' ? 'Sprache' : 'Language'}
                />
                <input
                  type="text"
                  value={skill.level}
                  onChange={(e) => updateSkill('languages', index, 'level', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'de' ? 'Niveau' : 'Level'}
                />
                <button
                  onClick={() => removeSkill('languages', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* IT Skills */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{language === 'de' ? 'IT-Kenntnisse' : 'IT Skills'}</h4>
            <button
              onClick={() => addSkill('it')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              {language === 'de' ? 'Hinzufügen' : 'Add'}
            </button>
          </div>
          <div className="space-y-2">
            {cvData.skills.it.map((skill, index) => (
              <div key={skill.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill('it', index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'de' ? 'IT-Kenntnis' : 'IT Skill'}
                />
                <input
                  type="text"
                  value={skill.level}
                  onChange={(e) => updateSkill('it', index, 'level', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'de' ? 'Niveau' : 'Level'}
                />
                <button
                  onClick={() => removeSkill('it', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Other Skills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">{language === 'de' ? 'Weitere Kenntnisse' : 'Other Skills'}</h4>
            <button
              onClick={() => addSkill('other')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              {language === 'de' ? 'Hinzufügen' : 'Add'}
            </button>
          </div>
          <div className="space-y-2">
            {cvData.skills.other.map((skill, index) => (
              <div key={skill.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill('other', index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'de' ? 'Kenntnis' : 'Skill'}
                />
                <input
                  type="text"
                  value={skill.level}
                  onChange={(e) => updateSkill('other', index, 'level', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={language === 'de' ? 'Niveau' : 'Level'}
                />
                <button
                  onClick={() => removeSkill('other', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'de' ? 'Projekte' : 'Projects'}
          </h3>
          <button
            onClick={addProject}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {language === 'de' ? 'Hinzufügen' : 'Add'}
          </button>
        </div>
        <div className="space-y-4">
          {cvData.projects.map((project, index) => (
            <div key={project.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{language === 'de' ? 'Projekt' : 'Project'} {index + 1}</h4>
                <button
                  onClick={() => removeProject(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Projektname' : 'Project Name'}
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Beschreibung' : 'Description'}
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={project.url}
                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'de' ? 'Zertifikate' : 'Certificates'}
          </h3>
          <button
            onClick={addCertificate}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {language === 'de' ? 'Hinzufügen' : 'Add'}
          </button>
        </div>
        <div className="space-y-4">
          {cvData.certificates.map((cert, index) => (
            <div key={cert.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{language === 'de' ? 'Zertifikat' : 'Certificate'} {index + 1}</h4>
                <button
                  onClick={() => removeCertificate(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Zertifikatsname' : 'Certificate Name'}
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Aussteller' : 'Issuer'}
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertificate(index, 'issuer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'de' ? 'Datum' : 'Date'}
                  </label>
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => updateCertificate(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YYYY"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hobbies */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'de' ? 'Hobbys' : 'Hobbies'}
        </h3>
        <textarea
          value={cvData.hobbies}
          onChange={(e) => onUpdate({ hobbies: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={language === 'de' ? 'Ihre Hobbys und Interessen...' : 'Your hobbies and interests...'}
        />
      </div>
    </div>
  );
};