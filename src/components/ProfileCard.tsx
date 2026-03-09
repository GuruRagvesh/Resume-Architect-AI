import React from "react";
import { ConsultantProfile } from "../types";

interface CroppedPreviewProps {
  images: string[] | null;
  box?: [number, number, number, number];
  pageIndex?: number;
  alt: string;
  className?: string;
}

const CroppedPreview: React.FC<CroppedPreviewProps> = ({ images, box, pageIndex, alt, className }) => {
  const target = images && typeof pageIndex === "number" ? images[pageIndex] : images?.[0];

  if (!target || !box) {
    return <div className={`crop-fallback ${className ?? ""}`}>{alt}</div>;
  }

  const [ymin, xmin, ymax, xmax] = box;
  const width = xmax - xmin;
  const height = ymax - ymin;

  if (width <= 0 || height <= 0) {
    return <div className={`crop-fallback ${className ?? ""}`}>{alt}</div>;
  }

  return (
    <div className={`crop-wrap ${className ?? ""}`}>
      <img
        src={target}
        alt={alt}
        style={{
          width: `${10000 / width}%`,
          height: `${10000 / height}%`,
          left: `-${(xmin / width) * 10}%`,
          top: `-${(ymin / height) * 10}%`
        }}
      />
    </div>
  );
};

interface ProfileCardProps {
  profile: ConsultantProfile;
  sourceImages: string[] | null;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="section">
    <h3>{title}</h3>
    <div>{children}</div>
  </section>
);

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, sourceImages }) => {
  return (
    <article className="profile-card" id="profile-card">
      <header className="profile-header">
        <CroppedPreview
          images={sourceImages}
          box={profile.photoBox}
          pageIndex={profile.photoPageIndex}
          alt="Profile photo"
          className="profile-photo"
        />
        <div>
          <p className="profile-overline">Consultant Profile</p>
          <h1>{profile.name}</h1>
          <p className="profile-title">{profile.title}</p>
        </div>
      </header>

      {profile.badgeBoxes?.length ? (
        <div className="badge-row">
          {profile.badgeBoxes.slice(0, 8).map((badge, i) => (
            <div key={`${badge.label}-${i}`} className="badge-item">
              <CroppedPreview
                images={sourceImages}
                box={badge.box2d}
                pageIndex={badge.pageIndex}
                alt={badge.label}
                className="badge-image"
              />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <Section title="Professional Summary">
        <p>{profile.summary}</p>
      </Section>

      <Section title="Core Expertise">
        <div className="chip-list">
          {profile.expertise.map((item, i) => (
            <span key={`${item}-${i}`} className="chip">
              {item}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Technical Skills">
        <p>
          <strong>Primary:</strong> {profile.skills.primary.join(", ")}
        </p>
        <p>
          <strong>Secondary:</strong> {profile.skills.secondary.join(", ")}
        </p>
        <p>
          <strong>Tools:</strong> {profile.skills.tools.join(", ")}
        </p>
      </Section>

      <Section title="Professional Experience">
        <ul>
          {profile.experience.map((item, i) => (
            <li key={`${item}-${i}`}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Key Projects">
        <div className="project-list">
          {profile.projects.map((project, i) => (
            <div key={`${project.client}-${i}`} className="project-item">
              <h4>
                {project.client} | {project.domain}
              </h4>
              <p>
                <strong>Duration:</strong> {project.duration} | <strong>Role:</strong> {project.role}
              </p>
              <p>{project.impact}</p>
              <p>
                <strong>Tech:</strong> {project.stack}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <div className="three-col">
        <Section title="Languages">
          <ul>{profile.languages.map((l, i) => <li key={`${l}-${i}`}>{l}</li>)}</ul>
        </Section>
        <Section title="Certifications">
          <ul>{profile.certifications.map((c, i) => <li key={`${c}-${i}`}>{c}</li>)}</ul>
        </Section>
        <Section title="Awards">
          <ul>{profile.awards.map((a, i) => <li key={`${a}-${i}`}>{a}</li>)}</ul>
        </Section>
      </div>

      <Section title="Education">
        <ul>
          {profile.education.map((edu, i) => (
            <li key={`${edu.degree}-${i}`}>
              {edu.degree} | {edu.institution} ({edu.year})
            </li>
          ))}
        </ul>
      </Section>

      {profile.customSections.map((section, i) => (
        <Section key={`${section.title}-${i}`} title={section.title}>
          <p>{section.content}</p>
        </Section>
      ))}
    </article>
  );
};

export default ProfileCard;
