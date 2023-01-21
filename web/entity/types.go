package entity

import "time"

// Status Type
type Status int

// Kind name
const (
	KindNameImage = "Image"
	KindNameCount = "Count"
	KindNameUser = "User"
	KindNameUserImage = "usersimage"
	KindNameSelectImage = "faceimage"
)

// Status values
const (
	StatusReady Status = iota
	StatusNG
	StatusPending
	StatusOK
	StatusPredicted
)

// Path of status
func (s Status) Path() string {
	switch s {
	case StatusReady:
		return "Ready"
	case StatusNG:
		return "NG"
	case StatusPending:
		return "Pending"
	case StatusOK:
		return "OK"
	case StatusPredicted:
		return "Predicted"
	default:
		return ""
	}
}

// Image type
type Image struct {
	ID          string
	ImageURL    string
	SourceURL   string
	PhotoURL    string
	Size        int
	Size0256    bool
	Size0512    bool
	Size1024    bool
	Parts       []int
	LabelName   string
	Status      Status
	PublishedAt time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Meta        []byte `datastore:",noindex"`
}

type UserImage struct {
	ID          string
	ImageURL    string
	UID         string
	UpdatedAt   time.Time
}
type UserImage2 struct {
	id          string
	ImageURL    string
	vector      []float64
	updatedAt   time.Time
}
// Count type
type Count struct {
	Ready     int
	NG        int
	Pending   int
	OK        int
	Predicted int
}
